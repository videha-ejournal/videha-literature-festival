import {readdir,readFile,writeFile} from 'node:fs/promises';
const names=(await readdir('public/assets/gajendra-covers')).sort();
const app=await readFile('public/app.js','utf8');
const next=`const extraGajendraCovers = ${JSON.stringify(names)}.map((name) => ["gajendra-covers/"+name, name.replace(/^[0-9]+-/,"").replace(/[_-]+/g," ").replace(/\\.[^.]+$/,"")]);`;
await writeFile('public/app.js',app.slice(0,app.indexOf('const extraGajendraCovers'))+next+'\n');
console.log(`Curated cover list: ${names.length}`);
