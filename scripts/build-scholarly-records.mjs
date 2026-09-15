import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const dist=path.join(root,'dist');
const site='https://videha-ejournal.github.io/videha-literature-festival/';
const publication='Videha — First Maithili Fortnightly eJournal';
const issn='2229-547X';
const today=new Date().toISOString().slice(0,10);
const esc=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const digest=value=>createHash('sha1').update(value).digest('hex').slice(0,14);
const isPdf=url=>/\.pdf(?:$|[?#])/i.test(url||'');

const pothi=JSON.parse(await readFile(path.join(dist,'data','pothi.json'),'utf8'));
const github=JSON.parse(await readFile(path.join(dist,'data','github-library.json'),'utf8'));
const archivePayload=JSON.parse(await readFile(path.join(dist,'data','archive.json'),'utf8'));

const records=[];
for(const item of pothi){
  records.push({
    id:`pothi-${digest(`${item.author||''}|${item.title}|${item.url}`)}`,
    kind:'pothi', title:item.title, author:item.author||'', source:item.url,
    detail:'Videha Pothi catalogue record', dateISO:'', journal:false
  });
}
for(const item of github){
  records.push({
    id:`github-${digest(`${item.repository||''}|${item.path||''}|${item.title}|${item.url}`)}`,
    kind:'github', title:item.title, author:'', source:item.url,
    detail:item.detail||item.category||'GitHub book & study edition', dateISO:'', journal:false
  });
}
for(const item of archivePayload.archive||[]){
  const version=item.version?`-v${item.version}`:'';
  const stable=`${String(item.publication||'archive').toLowerCase()}-${String(item.issue).padStart(3,'0')}${version}`;
  records.push({
    id:`issue-${stable}`, kind:'archive', title:item.title, author:'', source:item.source,
    detail:item.publication==='VIDEHA'?'Videha issue archive record':'Sadeha archive record',
    dateISO:item.dateISO||'', displayDate:item.date||'', journal:item.publication==='VIDEHA'
  });
}

const ids=new Set();
for(const record of records){
  if(ids.has(record.id)) throw new Error(`Duplicate scholarly-record id: ${record.id}`);
  ids.add(record.id);
  if(!record.title||!record.source) throw new Error(`Incomplete record ${record.id}`);
}

function citationMeta(record,canonical,language){
  const tags=[
    ['citation_title',record.title],
    ...(record.author?[['citation_author',record.author]]:[]),
    ...(record.dateISO?[['citation_publication_date',record.dateISO.replaceAll('-','/')]]:[]),
    ...(record.journal?[["citation_journal_title",publication],["citation_issn",issn]]:[]),
    ['citation_public_url',canonical],
    ['citation_language',language],
    ...(isPdf(record.source)?[['citation_pdf_url',record.source]]:[])
  ];
  return tags.map(([name,value])=>`  <meta name="${name}" content="${esc(value)}">`).join('\n');
}

function recordHtml(record,language){
  const en=language==='en';
  const canonical=`${site}${en?'en/':''}records/${record.id}/`;
  const mai=`${site}records/${record.id}/`;
  const eng=`${site}en/records/${record.id}/`;
  const description=en
    ? `Scholarly catalogue record for ${record.title} in the Videha Literature Festival research archive.`
    : `विदेह साहित्य उत्सव शोध-अभिलेखमे ${record.title} कऽ विद्वत् सूची-अभिलेख।`;
  const sourceLabel=en?'Open original source ↗':'मूल स्रोत खोलू ↗';
  const backLabel=en?'Return to scholarly record index':'शोध-अभिलेख सूचीपर आपस जाउ';
  const festivalLabel=en?'Festival home':'उत्सव मुख्य पृष्ठ';
  const authorLabel=en?'Author / creator as stated in source data':'स्रोत-दत्त लेखक / सर्जक';
  const categoryLabel=en?'Record class':'अभिलेख श्रेणी';
  const dateLabel=en?'Publication date':'प्रकाशन तिथि';
  const disclaimer=en
    ? 'This discovery record preserves the source catalogue data. It does not infer authorship or a publication date when the source data does not state one.'
    : 'ई खोज-अभिलेख स्रोत-सूचीक दत्तांश जकाँक-तँकाँ रखैत अछि। स्रोत-दत्तांशमे लेखकत्व वा प्रकाशन-तिथि नहि रहला पर ई ओकर अनुमान नहि करैत अछि।';
  return `<!doctype html>\n<html lang="${en?'en':'mai-Deva'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${esc(record.title)} · ${en?'Scholarly record':'शोध-अभिलेख'} · Videha Literature Festival</title>\n<meta name="description" content="${esc(description)}">\n<link rel="canonical" href="${canonical}">\n<link rel="alternate" hreflang="mai" href="${mai}">\n<link rel="alternate" hreflang="en" href="${eng}">\n<link rel="alternate" hreflang="x-default" href="${mai}">\n${citationMeta(record,canonical,en?'en':'mai')}\n<meta property="og:type" content="article"><meta property="og:title" content="${esc(record.title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}">\n<link rel="stylesheet" href="${en?'../../../':'../../'}styles.css">\n<style>main{max-width:900px;margin:auto;padding:56px 22px 100px}.record-card{margin:28px 0;padding:28px;border:1px solid var(--line);background:var(--cream)}.record-meta{display:grid;grid-template-columns:minmax(10rem,14rem) 1fr;gap:10px 18px;margin:26px 0}.record-meta dt{font-weight:700}.record-meta dd{margin:0;overflow-wrap:anywhere}.record-actions{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0}.record-actions a{font-weight:700}.record-note{color:var(--muted);font-size:.94rem}.language-switch{float:right;font-weight:700}</style></head><body><main>\n<a class="language-switch" href="${en?'../../../':'../../'}${en?'':'en/'}records/${record.id}/" hreflang="${en?'mai':'en'}">${en?'मैथिली':'English'}</a>\n<p class="eyebrow">VIDEHA LITERATURE FESTIVAL · ${en?'SCHOLARLY RECORD':'शोध-अभिलेख'}</p>\n<h1>${esc(record.title)}</h1>\n<div class="record-card"><dl class="record-meta"><dt>${categoryLabel}</dt><dd>${esc(record.detail)}</dd>${record.author?`<dt>${authorLabel}</dt><dd>${esc(record.author)}</dd>`:''}${record.dateISO?`<dt>${dateLabel}</dt><dd>${esc(record.displayDate||record.dateISO)}</dd>`:''}<dt>ISSN</dt><dd>${record.journal?issn:(en?'Not asserted for this non-issue catalogue record':'ई गैर-अंक सूची-अभिलेख लेल लागू नहि')}</dd></dl>\n<div class="record-actions"><a href="${esc(record.source)}">${sourceLabel}</a><a href="${en?'../':'../'}">${backLabel}</a><a href="${en?'../../../':'../../'}">${festivalLabel}</a></div><p class="record-note">${disclaimer}</p></div>\n</main></body></html>`;
}

for(const record of records){
  const maiDir=path.join(dist,'records',record.id);
  const enDir=path.join(dist,'en','records',record.id);
  await mkdir(maiDir,{recursive:true});
  await mkdir(enDir,{recursive:true});
  await writeFile(path.join(maiDir,'index.html'),recordHtml(record,'mai'));
  await writeFile(path.join(enDir,'index.html'),recordHtml(record,'en'));
}

const sorted=[...records].sort((a,b)=>a.title.localeCompare(b.title,['mai','hi','en'],{numeric:true,sensitivity:'base'}));
function indexHtml(language){
  const en=language==='en';
  const canonical=`${site}${en?'en/':''}records/`;
  const mai=`${site}records/`, eng=`${site}en/records/`;
  const items=sorted.map(r=>`<li><a href="${r.id}/">${esc(r.title)}</a><span>${esc(r.detail)}${r.author?` · ${esc(r.author)}`:''}</span></li>`).join('');
  return `<!doctype html><html lang="${en?'en':'mai-Deva'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${en?'Scholarly record index':'शोध-अभिलेख सूची'} · Videha Literature Festival</title><meta name="description" content="${en?'Stable bilingual discovery routes for verified Videha Literature Festival catalogue and archive records.':'विदेह साहित्य उत्सवक सत्यापित सूची आ अभिलेख लेल स्थिर द्विभाषिक खोज-मार्ग।'}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="mai" href="${mai}"><link rel="alternate" hreflang="en" href="${eng}"><link rel="alternate" hreflang="x-default" href="${mai}"><link rel="stylesheet" href="${en?'../../':'../'}styles.css"><style>main{max-width:1100px;margin:auto;padding:56px 22px 100px}ol{columns:2;column-gap:36px;padding-left:24px}li{break-inside:avoid;margin:0 0 14px}li a{display:block;font-weight:700}li span{display:block;color:var(--muted);font-size:.78rem}@media(max-width:760px){ol{columns:1}}</style></head><body><main><p class="eyebrow">VIDEHA LITERATURE FESTIVAL</p><h1>${en?'Scholarly record index':'शोध-अभिलेख सूची'}</h1><p>${en?`${records.length.toLocaleString('en-IN')} stable bilingual record routes generated from verified festival datasets.`:`सत्यापित उत्सव-दत्तांशसँ बनल ${records.length.toLocaleString('en-IN')} स्थिर द्विभाषिक अभिलेख-मार्ग।`}</p><p><a href="${en?'../../':'../'}">${en?'← Festival home':'← उत्सव मुख्य पृष्ठ'}</a> · <a href="${en?'../../records/':'../en/records/'}" hreflang="${en?'mai':'en'}">${en?'मैथिली':'English'}</a></p><ol>${items}</ol></main></body></html>`;
}
await mkdir(path.join(dist,'records'),{recursive:true});
await mkdir(path.join(dist,'en','records'),{recursive:true});
await writeFile(path.join(dist,'records','index.html'),indexHtml('mai'));
await writeFile(path.join(dist,'en','records','index.html'),indexHtml('en'));

const cataloguePath=path.join(dist,'catalogue.html');
let catalogue=await readFile(cataloguePath,'utf8');
if(!catalogue.includes('href="records/"')) catalogue=catalogue.replace('<a href="#bookwise">Bookwise index</a>','<a href="#bookwise">Bookwise index</a><a href="records/">Scholarly records</a>');
if(!/rel="canonical"/i.test(catalogue)) catalogue=catalogue.replace('</title>',`</title><link rel="canonical" href="${site}catalogue.html">`);
await writeFile(cataloguePath,catalogue);

const entries=[];
const push=(loc,mai,en,priority='0.70')=>entries.push(`  <url>\n    <loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority>\n    <xhtml:link rel="alternate" hreflang="mai" href="${mai}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>\n  </url>`);
push(site,site,`${site}en/`,'1.00');
push(`${site}en/`,site,`${site}en/`,'0.98');
entries.push(`  <url><loc>${site}catalogue.html</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.90</priority></url>`);
push(`${site}records/`,`${site}records/`,`${site}en/records/`,'0.92');
push(`${site}en/records/`,`${site}records/`,`${site}en/records/`,'0.90');
for(const record of records){
  const mai=`${site}records/${record.id}/`, en=`${site}en/records/${record.id}/`;
  push(mai,mai,en);
  push(en,mai,en,'0.68');
}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
await writeFile(path.join(dist,'sitemap.xml'),sitemap);

const sample=records[0];
const sampleHtml=await readFile(path.join(dist,'records',sample.id,'index.html'),'utf8');
for(const token of ['citation_title','citation_public_url','hreflang="mai"','hreflang="en"']) if(!sampleHtml.includes(token)) throw new Error(`Scholarly route invariant failed: ${token}`);
if(!sitemap.includes(`/records/${sample.id}/`)) throw new Error('Scholarly records missing from sitemap');
console.log(`Generated ${records.length} bilingual scholarly record pairs (${records.length*2} item pages) plus bilingual record indexes and expanded sitemap.`);
