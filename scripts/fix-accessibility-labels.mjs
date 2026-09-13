import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dist=path.resolve(import.meta.dirname,"..","dist");
const homeFile=path.join(dist,"index.html");
let html=await readFile(homeFile,"utf8");
const labels={
  bookSearch:"Search book titles, authors and series",
  bookCategory:"Filter books by shelf or category",
  publication:"Filter periodical archive by publication",
  issueYear:"Filter Videha issues by year"
};
for(const [id,label] of Object.entries(labels)){
  const re=new RegExp(`(<(?:input|select|textarea)\\b[^>]*\\bid=["']${id}["'])(?![^>]*\\baria-label=)`,`i`);
  html=html.replace(re,`$1 aria-label="${label}"`);
}
await writeFile(homeFile,html);

const catalogueFile=path.join(dist,"catalogue.html");
let catalogue=await readFile(catalogueFile,"utf8");
if(!catalogue.includes('id="catalogueIndexesTitle"')){
  catalogue=catalogue.replace(/(<nav class="catalogue-nav"[\s\S]*?<\/nav>)/i,'$1<h2 id="catalogueIndexesTitle">Browse the complete catalogue</h2>');
}
await writeFile(catalogueFile,catalogue);
console.log(`Ensured accessible names for ${Object.keys(labels).length} archive/catalogue controls and repaired static catalogue heading order.`);
