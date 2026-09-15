import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const recordsRoot=path.resolve(import.meta.dirname,'..','dist','en','records');
const entries=await readdir(recordsRoot,{withFileTypes:true});
let fixed=0;
for(const entry of entries){
  if(!entry.isDirectory()) continue;
  const file=path.join(recordsRoot,entry.name,'index.html');
  let html=await readFile(file,'utf8');
  const before='href="../../../">Festival home</a>';
  const after='href="../../">Festival home</a>';
  if(html.includes(before)){
    html=html.replace(before,after);
    await writeFile(file,html);
    fixed++;
  }
  if(!html.includes(after)) throw new Error(`English scholarly record home link invariant failed: ${file}`);
}
if(fixed===0) console.log('English scholarly record home links already point to /en/.');
else console.log(`Corrected ${fixed} English scholarly record home link(s) to /en/.`);
