#!/usr/bin/env python3
"""Discover Videha Festival recordings and build provenance-aware transcript drafts.

Priority: publisher/uploaded captions -> host automatic captions -> local Whisper ASR.
Nothing produced by this script is labelled human/editorially verified. Verification is a
separate state that requires an explicit review record.
"""
from __future__ import annotations
import argparse, hashlib, html, json, os, re, subprocess, sys, tempfile, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

UA='Videha-Transcript-Pipeline/1.0'
IA_IDS=[f'videha-discussion-criticism-part-{i}' for i in range(1,13)]
MEDIA_EXT={'.mp3','.m4a','.ogg','.wav','.flac','.mp4','.mkv','.webm','.mov'}
CAP_EXT={'.vtt','.srt'}

def run(cmd,check=True,cwd=None):
    return subprocess.run(cmd,text=True,capture_output=True,check=check,cwd=cwd)

def get_json(url):
    req=urllib.request.Request(url,headers={'User-Agent':UA})
    with urllib.request.urlopen(req,timeout=180) as r: return json.load(r)

def slug(s):
    core=re.sub(r'[^A-Za-z0-9]+','-',s).strip('-').lower()[:80] or 'media'
    return f'{core}-{hashlib.sha1(s.encode()).hexdigest()[:10]}'

def discover_youtube(app_text):
    out=[]; seen=set()
    for kind,id_,url,title in re.findall(r'\{group:"[^"]+",title:"([^"]+)"[^}]*kind:"(video|playlist)"[^}]*id:"([^"]+)"[^}]*url:"([^"]+)"',app_text):
        pass
    # Use independent regex so field order changes do not silently drop sources.
    block=re.search(r'const rangmanchMedia\s*=\s*\[(.*?)\];',app_text,re.S)
    if not block: return out
    for obj in re.findall(r'\{(.*?)\}',block.group(1),re.S):
        def field(name):
            m=re.search(rf'{name}:"([^"]*)"',obj); return m.group(1) if m else ''
        kind,id_,url,title=field('kind'),field('id'),field('url'),field('title')
        if kind not in {'video','playlist'} or not (id_ or url): continue
        key=f'{kind}:{id_ or url}'
        if key in seen: continue
        seen.add(key)
        out.append({'provider':'youtube','containerKind':kind,'containerId':id_,'containerUrl':url,'containerTitle':title})
    return out

def expand_youtube(container):
    target=container['containerUrl'] or (f"https://www.youtube.com/watch?v={container['containerId']}" if container['containerKind']=='video' else f"https://www.youtube.com/playlist?list={container['containerId']}")
    cp=run(['yt-dlp','--flat-playlist','--dump-single-json','--no-warnings',target],check=False)
    if cp.returncode:
        return [{'sourceId':slug(target),'provider':'youtube','url':target,'title':container['containerTitle'],'discoveryError':(cp.stderr or '')[-1000:]}]
    data=json.loads(cp.stdout)
    entries=data.get('entries') or [data]
    out=[]
    for e in entries:
        vid=e.get('id'); url=e.get('url') or (f'https://www.youtube.com/watch?v={vid}' if vid else target)
        if url and not url.startswith('http') and vid: url=f'https://www.youtube.com/watch?v={vid}'
        out.append({'sourceId':f'youtube-{vid}' if vid else slug(url),'provider':'youtube','url':url,'title':e.get('title') or container['containerTitle'],'containerTitle':container['containerTitle'],'videoId':vid})
    return out

def normalize_ia_key(name):
    stem=Path(name).stem.lower()
    stem=re.sub(r'(_?512kb|_?h264|_?mpeg4|_?vbr|_?64kb|_?128kb|_?256kb)$','',stem)
    return re.sub(r'[^a-z0-9\u0900-\u097f]+',' ',stem).strip()

def discover_ia(identifier):
    data=get_json(f'https://archive.org/metadata/{identifier}')
    files=data.get('files',[]); caps={}
    for f in files:
        name=f.get('name',''); ext=Path(name).suffix.lower()
        if ext in CAP_EXT: caps.setdefault(normalize_ia_key(name),[]).append(name)
    candidates=[]
    for f in files:
        name=f.get('name',''); ext=Path(name).suffix.lower()
        if ext not in MEDIA_EXT: continue
        source=str(f.get('source','')).lower(); fmt=str(f.get('format','')).lower()
        # Prefer original media and common speech-friendly derivatives; avoid thumbnails/sample files.
        if any(x in name.lower() for x in ('thumb','spectrogram','waveform')): continue
        if source and source!='original' and not any(x in fmt for x in ('vbr mp3','mpeg4','h.264','ogg')): continue
        key=normalize_ia_key(name); cap=(caps.get(key) or [None])[0]
        candidates.append({'sourceId':f'ia-{identifier}-{hashlib.sha1(name.encode()).hexdigest()[:12]}','provider':'archive.org','identifier':identifier,'fileName':name,'url':f"https://archive.org/download/{identifier}/{urllib.parse.quote(name)}",'title':Path(name).stem,'captionUrl':f"https://archive.org/download/{identifier}/{urllib.parse.quote(cap)}" if cap else None,'captionFile':cap,'size':int(f.get('size') or 0),'format':f.get('format')})
    # De-duplicate obvious audio/video derivatives of the same recording, preferring captioned, then audio, then smaller file.
    best={}
    for item in candidates:
        k=normalize_ia_key(item['fileName']); score=(1 if item.get('captionUrl') else 0,1 if Path(item['fileName']).suffix.lower() in {'.mp3','.m4a','.ogg','.wav','.flac'} else 0,-item.get('size',0))
        if k not in best or score>best[k][0]: best[k]=(score,item)
    return [v[1] for v in best.values()]

def discover(app,out):
    text=Path(app).read_text(encoding='utf-8')
    items=[]
    for c in discover_youtube(text): items.extend(expand_youtube(c))
    for ident in IA_IDS:
        try: items.extend(discover_ia(ident))
        except Exception as e: items.append({'sourceId':f'ia-{ident}-discovery-error','provider':'archive.org','identifier':ident,'title':ident,'discoveryError':str(e)})
    dedup={i['sourceId']:i for i in items}
    payload={'generated':datetime.now(timezone.utc).isoformat(),'sourceCount':len(dedup),'items':sorted(dedup.values(),key=lambda x:x['sourceId'])}
    Path(out).write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f"Discovered {len(dedup)} media records")

def fetch_url(url,dest):
    req=urllib.request.Request(url,headers={'User-Agent':UA})
    with urllib.request.urlopen(req,timeout=600) as r,open(dest,'wb') as f:
        while True:
            b=r.read(1024*1024)
            if not b: break
            f.write(b)

def vtt_to_text(text):
    text=re.sub(r'^WEBVTT.*?(?:\n\n|$)','',text,flags=re.S)
    text=re.sub(r'(?m)^\d+\s*$','',text)
    text=re.sub(r'(?m)^\d\d?:\d\d(?::\d\d)?[.,]\d+\s+-->.*$','',text)
    text=re.sub(r'<[^>]+>','',text)
    lines=[]; prev=None
    for line in text.splitlines():
        line=line.strip()
        if not line or line.startswith(('NOTE','Kind:','Language:')): continue
        if line!=prev: lines.append(line); prev=line
    return '\n'.join(lines).strip()

def youtube_caption(item,work):
    cp=run(['yt-dlp','--dump-single-json','--skip-download','--no-warnings',item['url']],check=False)
    if cp.returncode: return None
    meta=json.loads(cp.stdout); choices=[]
    for kind,key in [('publisher-caption','subtitles'),('host-auto-caption','automatic_captions')]:
        tracks=meta.get(key) or {}
        for lang in ('mai','hi','ne','en'):
            vals=tracks.get(lang) or []
            vtt=next((v for v in vals if v.get('ext') in {'vtt','srv3','srv2','srv1','json3'}),None)
            if vtt and vtt.get('url'): choices.append((kind,lang,vtt['url'])); break
        if choices: break
    if not choices: return None
    kind,lang,url=choices[0]; dest=work/'caption.vtt'; fetch_url(url,dest)
    text=vtt_to_text(dest.read_text(encoding='utf-8',errors='replace'))
    return {'text':text,'method':kind,'language':lang,'captionSourceUrl':url}

def ia_caption(item,work):
    if not item.get('captionUrl'): return None
    dest=work/('caption'+Path(item.get('captionFile') or '.vtt').suffix)
    fetch_url(item['captionUrl'],dest)
    raw=dest.read_text(encoding='utf-8',errors='replace')
    return {'text':vtt_to_text(raw),'method':'publisher-caption','language':'und','captionSourceUrl':item['captionUrl']}

def download_audio(item,work):
    out=work/'audio.%(ext)s'
    if item['provider']=='youtube':
        cp=run(['yt-dlp','--no-playlist','-f','ba/b','-x','--audio-format','mp3','--audio-quality','5','-o',str(out),item['url']],check=False)
        if cp.returncode: raise RuntimeError((cp.stderr or '')[-1500:])
        files=list(work.glob('audio.*')); return next(p for p in files if p.suffix!='.part')
    ext=Path(urllib.parse.urlparse(item['url']).path).suffix or '.bin'; src=work/f'source{ext}'; fetch_url(item['url'],src)
    audio=work/'audio.mp3'; cp=run(['ffmpeg','-y','-loglevel','error','-i',str(src),'-vn','-ac','1','-ar','16000','-b:a','48k',str(audio)],check=False)
    if cp.returncode: raise RuntimeError((cp.stderr or '')[-1500:])
    return audio

def whisper_transcribe(audio,model_name):
    from faster_whisper import WhisperModel
    model=WhisperModel(model_name,device='cpu',compute_type='int8',cpu_threads=max(2,os.cpu_count() or 2))
    segments,info=model.transcribe(str(audio),beam_size=5,vad_filter=True,condition_on_previous_text=True)
    parts=[]; vtt=['WEBVTT','']
    def ts(x):
        ms=int(round(x*1000)); h,ms=divmod(ms,3600000); m,ms=divmod(ms,60000); s,ms=divmod(ms,1000); return f'{h:02}:{m:02}:{s:02}.{ms:03}'
    for seg in segments:
        t=seg.text.strip()
        if not t: continue
        parts.append(t); vtt.extend([f'{ts(seg.start)} --> {ts(seg.end)}',t,''])
    return {'text':'\n'.join(parts),'vtt':'\n'.join(vtt),'method':'whisper-asr','language':getattr(info,'language','und'),'languageProbability':getattr(info,'language_probability',None),'duration':getattr(info,'duration',None)}

def quality(text):
    chars=len(text); words=len(text.split()); replacement=text.count('\ufffd'); private=sum(unicodedata.category(c)=='Co' for c in text) if False else 0
    deva=sum('\u0900'<=c<='\u097f' for c in text); letters=sum(c.isalpha() for c in text)
    duplicate=0; lines=[x.strip() for x in text.splitlines() if x.strip()]
    if lines: duplicate=1-len(set(lines))/len(lines)
    return {'characters':chars,'words':words,'replacementCharacters':replacement,'devanagariLetterShare':round(deva/max(letters,1),4),'duplicateLineShare':round(duplicate,4),'empty':not bool(text.strip())}

def process(item,out,model):
    rec={**item,'processed':datetime.now(timezone.utc).isoformat(),'humanVerified':False,'editorialStatus':'machine-or-host-transcript-needs-videha-review'}
    if item.get('discoveryError'): rec.update(status='discovery-failed',error=item['discoveryError']); return rec
    try:
        with tempfile.TemporaryDirectory(prefix='videha-transcript-') as td:
            work=Path(td); cap=youtube_caption(item,work) if item['provider']=='youtube' else ia_caption(item,work)
            if cap and cap.get('text','').strip(): data=cap
            else:
                audio=download_audio(item,work); data=whisper_transcribe(audio,model)
            text=data['text'].strip(); base=slug(item['sourceId']); txt=out/f'{base}.txt'; vtt=out/f'{base}.vtt'
            txt.write_text(text,encoding='utf-8')
            if data.get('vtt'): vtt.write_text(data['vtt'],encoding='utf-8')
            rec.update(status='transcript-draft',transcriptMethod=data['method'],detectedLanguage=data.get('language'),languageProbability=data.get('languageProbability'),duration=data.get('duration'),textAsset=txt.name,vttAsset=vtt.name if vtt.exists() else None,quality=quality(text))
    except Exception as e: rec.update(status='transcription-failed',error=str(e))
    return rec

def transcribe(inventory,out_dir,shard_index,shard_count,model,limit=None):
    out=Path(out_dir); out.mkdir(parents=True,exist_ok=True)
    items=json.loads(Path(inventory).read_text(encoding='utf-8'))['items']
    items=[x for i,x in enumerate(items) if i%shard_count==shard_index]
    if limit: items=items[:limit]
    recs=[]
    for n,item in enumerate(items,1):
        print(f'[{n}/{len(items)}] {item.get("title")}',flush=True); r=process(item,out,model); recs.append(r); print(' ->',r['status'],flush=True)
    (out/'manifest.json').write_text(json.dumps({'generated':datetime.now(timezone.utc).isoformat(),'shardIndex':shard_index,'shardCount':shard_count,'records':recs},ensure_ascii=False,indent=2),encoding='utf-8')
    return 1 if any(r['status'] not in {'transcript-draft'} for r in recs) else 0

def main():
    p=argparse.ArgumentParser(); sp=p.add_subparsers(dest='cmd',required=True)
    d=sp.add_parser('discover'); d.add_argument('--app',required=True); d.add_argument('--out',required=True)
    t=sp.add_parser('transcribe'); t.add_argument('--inventory',required=True); t.add_argument('--out',required=True); t.add_argument('--shard-index',type=int,default=0); t.add_argument('--shard-count',type=int,default=1); t.add_argument('--model',default=os.environ.get('WHISPER_MODEL','small')); t.add_argument('--limit',type=int)
    a=p.parse_args()
    if a.cmd=='discover': discover(a.app,a.out); return 0
    return transcribe(a.inventory,a.out,a.shard_index,a.shard_count,a.model,a.limit)
if __name__=='__main__': raise SystemExit(main())
