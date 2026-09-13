import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const rootUrl = "https://videha-ejournal.github.io/videha-literature-festival/";
const englishUrl = `${rootUrl}en/`;
const alternateBlock = `  <link rel="alternate" hreflang="mai" href="${rootUrl}">\n  <link rel="alternate" hreflang="en" href="${englishUrl}">\n  <link rel="alternate" hreflang="x-default" href="${rootUrl}">`;

async function fix(filePath, expectedCanonical) {
  let html = await readFile(filePath, "utf8");
  html = html.replace(/\s*<link rel="alternate" hreflang="(?:mai|en|x-default)" href="[^"]+">/g, "");
  const canonical = `<link rel="canonical" href="${expectedCanonical}">`;
  if (!html.includes(canonical)) throw new Error(`Missing expected canonical in ${filePath}`);
  html = html.replace(canonical, `${canonical}\n${alternateBlock}`);
  await writeFile(filePath, html);
  return html;
}

const maithili = await fix(path.join(dist, "index.html"), rootUrl);
const english = await fix(path.join(dist, "en", "index.html"), englishUrl);

const checks = [
  [maithili.includes('<html lang="mai-Deva"'), "root language is Maithili"],
  [english.includes('<html lang="en"'), "English language is English"],
  [maithili.includes(`hreflang="mai" href="${rootUrl}"`), "root Maithili alternate"],
  [maithili.includes(`hreflang="en" href="${englishUrl}"`), "root English alternate"],
  [english.includes(`hreflang="mai" href="${rootUrl}"`), "English page Maithili alternate"],
  [english.includes(`hreflang="en" href="${englishUrl}"`), "English page English alternate"],
  [!maithili.includes(`${rootUrl}mai/`), "no stale /mai/ alternate on root"],
  [!english.includes(`${rootUrl}mai/`), "no stale /mai/ alternate on English page"],
];
for (const [ok, label] of checks) if (!ok) throw new Error(`hreflang repair failed: ${label}`);
console.log("Repaired reciprocal Maithili/English hreflang metadata.");
