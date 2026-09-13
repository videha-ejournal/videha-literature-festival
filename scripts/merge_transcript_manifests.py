#!/usr/bin/env python3
import argparse, glob, json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

p=argparse.ArgumentParser(); p.add_argument('--inventory',required=True); p.add_argument('--glob',required=True); p.add_argument('--out',required=True); a=p.parse_args()
inv=json.loads(Path(a.inventory).read_text(encoding='utf-8')); expected={x['sourceId'] for x in inv.get('items',[])}
records=[]
for f in glob.glob(a.glob,recursive=True):
    try: records.extend(json.loads(Path(f).read_text(encoding='utf-8')).get('records',[]))
    except Exception as e: print('WARN',f,e)
by={r.get('sourceId'):r for r in records if r.get('sourceId')}; missing=sorted(expected-set(by)); extra=sorted(set(by)-expected)
counts=Counter(r.get('status','unknown') for r in by.values())
complete=not missing and not extra and len(by)==len(expected) and counts.get('transcript-draft',0)==len(expected)
out={'generated':datetime.now(timezone.utc).isoformat(),'sourceCount':len(expected),'recordCount':len(by),'summary':dict(counts),'missingSourceIds':missing,'extraSourceIds':extra,'machineTranscriptionComplete':complete,'humanVerifiedCount':sum(bool(r.get('humanVerified')) for r in by.values()),'records':sorted(by.values(),key=lambda x:x.get('sourceId',''))}
Path(a.out).write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:out[k] for k in ('sourceCount','recordCount','summary','machineTranscriptionComplete','humanVerifiedCount')},indent=2))
raise SystemExit(0 if complete else 1)
