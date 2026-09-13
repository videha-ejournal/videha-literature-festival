import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const file=path.resolve(import.meta.dirname,"..","dist","index.html");
let html=await readFile(file,"utf8");
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
await writeFile(file,html);
console.log(`Ensured accessible names for ${Object.keys(labels).length} archive/catalogue controls.`);
