import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const out=path.join(root,"dist");
const reportPath=path.join(out,"accessibility","automated-audit.json");
const htmlFiles=[];

async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const p=path.join(dir,entry.name);
    if(entry.isDirectory()) await walk(p);
    else if(entry.isFile()&&entry.name.endsWith('.html')) htmlFiles.push(p);
  }
}
await walk(out);

const results=[];
const issues=[];
const add=(file,rule,message,level='error')=>issues.push({file:path.relative(out,file),rule,message,level});
for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
  const rel=path.relative(out,file);
  const checks=[];
  const check=(rule,ok,message,level='error')=>{checks.push({rule,ok,message,level});if(!ok)add(file,rule,message,level);};
  check('html-lang',/<html\b[^>]*\blang=["'][^"']+["']/i.test(html),'Document must declare a language.');
  check('title',/<title>\s*[^<]+\s*<\/title>/i.test(html),'Document must have a non-empty title.');
  check('main-landmark',/<main\b/i.test(html),'Document must contain a main landmark.');
  check('h1',/<h1\b[^>]*>\s*[\s\S]*?<\/h1>/i.test(html),'Document must contain an H1.');
  check('viewport',/<meta\b[^>]*name=["']viewport["']/i.test(html),'Document must include a responsive viewport meta tag.');
  check('skip-link',rel==='index.html'?/href=["']#main["']/i.test(html):true,'Homepage must expose a skip-to-main link.');
  const ids=[...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
  check('duplicate-ids',new Set(ids).size===ids.length,'IDs must be unique.');
  const imgs=[...html.matchAll(/<img\b[^>]*>/gi)].map(m=>m[0]);
  check('img-alt',imgs.every(tag=>/\balt=["'][^"']*["']/i.test(tag)),'Every image must have an alt attribute.');
  const iframes=[...html.matchAll(/<iframe\b[^>]*>/gi)].map(m=>m[0]);
  check('iframe-title',iframes.every(tag=>/\btitle=["'][^"']+["']/i.test(tag)),'Every iframe must have a non-empty title.');
  const blankLinks=[...html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)].map(m=>m[0]);
  check('blank-rel',blankLinks.every(tag=>/\brel=["'][^"']*noopener[^"']*["']/i.test(tag)),'Links opening a new tab must include rel=noopener.');
  const buttons=[...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)];
  check('button-name',buttons.every(m=>/\baria-label=["'][^"']+["']/i.test(m[0])||m[1].replace(/<[^>]+>/g,'').trim().length>0),'Buttons must have accessible names.');
  const inputs=[...html.matchAll(/<(input|select|textarea)\b[^>]*>/gi)].map(m=>m[0]);
  check('form-name',inputs.every(tag=>{
    if(/\baria-label=["'][^"']+["']/i.test(tag)||/\baria-labelledby=["'][^"']+["']/i.test(tag)) return true;
    const id=tag.match(/\bid=["']([^"']+)["']/i)?.[1];
    return Boolean(id && new RegExp(`<label[^>]*for=["']${id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`,'i').test(html));
  }),'Form controls must have labels or accessible names.');
  const headings=[...html.matchAll(/<h([1-6])\b/gi)].map(m=>Number(m[1]));
  let skip=false;for(let i=1;i<headings.length;i++)if(headings[i]-headings[i-1]>1)skip=true;
  check('heading-order',!skip,'Heading levels must not skip downward by more than one level.','warning');
  check('reduced-motion',rel==='index.html'?/prefers-reduced-motion/i.test(html)||/enhancements\.css/i.test(html):true,'Homepage must include reduced-motion support.','warning');
  results.push({file:rel,checks});
}

const errors=issues.filter(x=>x.level==='error');
const passed=results.reduce((n,r)=>n+r.checks.filter(c=>c.ok).length,0);
const totalChecks=results.reduce((n,r)=>n+r.checks.length,0);
const report={generated:new Date().toISOString(),standard:'WCAG 2.2 AA automated structural gate',scope:{htmlFiles:htmlFiles.length},summary:{errors:errors.length,warnings:issues.length-errors.length,passed,checks:totalChecks},limitations:['Automated structural checks cannot certify screen-reader behaviour, colour contrast in all rendered states, cognitive accessibility, caption accuracy, transcript accuracy, or semantic quality of legacy external PDFs.','Manual assistive-technology testing remains part of the published conformance process.'],issues,results};
await writeFile(reportPath,JSON.stringify(report,null,2));
console.log(`Accessibility audit: ${report.summary.checks} checks across ${htmlFiles.length} HTML files; ${errors.length} errors; ${report.summary.warnings} warnings.`);
if(errors.length){
  errors.slice(0,30).forEach(x=>console.error(`${x.file}: ${x.rule}: ${x.message}`));
  process.exitCode=1;
}
