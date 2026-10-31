import {readFile,writeFile} from 'node:fs/promises';
const file='public/app.js';
let app=await readFile(file,'utf8');
app=app.replaceAll('fetch(`data/archive.json?v=${encodeURIComponent(archiveMeta.generated||"")}`','fetch(`${dataRoot}data/archive.json?v=${encodeURIComponent(archiveMeta.generated||"")}`');
await writeFile(file,app);
