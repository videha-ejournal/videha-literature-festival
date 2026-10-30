import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { archiveStats } from './archive.mjs';
const root=path.resolve(import.meta.dirname,'..');const source=path.join(root,'public');const out=path.join(root,'dist');
const manifest=JSON.parse(await readFile(path.join(root,'scripts/sources/videha-archive-manifest.json'),'utf8'));const stats=archiveStats(manifest);
await rm(out,{recursive:true,force:true});await cp(source,out,{recursive:true});
const index=path.join(out,'index.html');let html=await readFile(index,'utf8');html=html.replace(/\{\{(\w+)\}\}/g,(_,key)=>key in stats?stats[key]:_);const meta={...stats,stats,currentIssue:manifest.currentIssue,currentIssueDate:manifest.currentIssueDate,currentIssueUrl:manifest.currentIssueUrl};html=html.replace('</head>',`<script id="archiveMeta" type="application/json">${JSON.stringify(meta)}</script></head>`);await writeFile(index,html);await writeFile(path.join(out,'.nojekyll'),'');
const maiDir=path.join(out,'mai');await mkdir(maiDir,{recursive:true});let mai=html.replace('<html lang="en">','<html lang="mai">').replace('<title>Videha Literature Festival</title>','<title>विदेह साहित्य उत्सव</title>').replace('href="mai/"','href="../"').replace('मैथिली · Maithili','English').replace('assets/','../assets/').replace('href="styles.css"','href="../styles.css"').replace('href="atlas-feature.css"','href="../atlas-feature.css"').replace('href="ui-polish.css"','href="../ui-polish.css"').replace('src="app.js"','src="../app.js"');await writeFile(path.join(maiDir,'index.html'),mai);
console.log(`Core build: ${stats.videhaIssues} archived Videha issues, ${stats.totalFiles} preserved files`);
