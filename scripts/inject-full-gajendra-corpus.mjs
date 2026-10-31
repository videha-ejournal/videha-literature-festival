import {readFile,writeFile} from 'node:fs/promises';
const source=await readFile('scripts/sources/gajendra-thakur-samagra.htm','utf8');
const start=source.indexOf('const gajendraPdfCorpus=['), end=source.indexOf('];',start);
const section=source.slice(start,end);
const books=[...section.matchAll(/\{title:'([^']+)'[^}]*?file:'([^']+)'[^}]*?group:'([^']+)'/g)].map(([,title,file,group])=>({section:'00 · स्थानीय PDF corpus',title,detail:`Gajendra Thakur Samagra · ${group}`,file:`https://videha-ejournal.github.io/videha-ejournal/${file}`}));
const file='dist/app.js'; let app=await readFile(file,'utf8');
const additions=books.map(b=>`{section:${JSON.stringify(b.section)},title:${JSON.stringify(b.title)},detail:${JSON.stringify(b.detail)},file:${JSON.stringify(b.file)}}`).join(',');
app=app.replace('const gajendraPdf = ',`const gajendraCorpusBooks=[${additions}];gajendraBooks.push(...gajendraCorpusBooks.filter(candidate=>!gajendraBooks.some(existing=>existing.title===candidate.title||existing.file===candidate.file)));const gajendraPdf = `);
await writeFile(file,app); console.log(`Injected ${books.length} Section 00 corpus records`);
