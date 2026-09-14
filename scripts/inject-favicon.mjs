import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const faviconAsset = path.join(dist, "assets", "vlf-logo.png");
const appPath = path.join(root, "public", "app.js");
const faviconUrl = "https://videha-ejournal.github.io/videha-literature-festival/assets/vlf-logo.png";
const utilityCssUrl = "https://videha-ejournal.github.io/videha-literature-festival/utility-restoration.css";
const faviconLinks = [
  `<link rel="icon" type="image/png" href="${faviconUrl}" data-vlf-favicon="icon">`,
  `<link rel="shortcut icon" type="image/png" href="${faviconUrl}" data-vlf-favicon="shortcut">`,
  `<link rel="apple-touch-icon" href="${faviconUrl}" data-vlf-favicon="apple-touch">`,
].join("\n  ");
const utilityLink = `<link rel="stylesheet" href="${utilityCssUrl}" data-vlf-utility-style>`;

await access(faviconAsset);
const appSource = await readFile(appPath, "utf8");
const languageObject = appSource.match(/const\s+langs\s*=\s*(\{[^\n]+\});/);
if (!languageObject) throw new Error("Unable to verify Festival translation language list in public/app.js");
const languages = JSON.parse(languageObject[1]);
if (Object.keys(languages).length !== 41) throw new Error(`Expected 41 translation languages; found ${Object.keys(languages).length}`);

for (const relativePath of ["index.html", path.join("en", "index.html")]) {
  const filePath = path.join(dist, relativePath);
  let html = await readFile(filePath, "utf8");

  html = html.replace(/\n\s*<link[^>]+data-vlf-favicon="[^"]+"[^>]*>/g, "");
  html = html.replace(/\n\s*<link[^>]+data-vlf-utility-style[^>]*>/g, "");
  if (!/<head\b[^>]*>/i.test(html)) throw new Error(`Missing <head> in ${relativePath}`);

  const viewport = /(<meta\s+name="viewport"[^>]*>)/i;
  if (viewport.test(html)) html = html.replace(viewport, `$1\n  ${faviconLinks}\n  ${utilityLink}`);
  else html = html.replace(/<head\b[^>]*>/i, (head) => `${head}\n  ${faviconLinks}\n  ${utilityLink}`);

  const utilityMatch = html.match(/<div\s+class="([^"]*\butility\b[^"]*)"([^>]*)>/i);
  if (!utilityMatch) throw new Error(`Missing utility controls in ${relativePath}`);
  if (!/\bvlf-utility-restored\b/.test(utilityMatch[1])) {
    const updatedClass = `${utilityMatch[1]} vlf-utility-restored`.replace(/\s+/g, " ").trim();
    html = html.replace(utilityMatch[0], `<div class="${updatedClass}"${utilityMatch[2]}>`);
  }

  for (const id of ["listenBtn", "translateBtn", "accessBtn", "translatePanel", "accessPanel", "language", "goTranslate"]) {
    if (!new RegExp(`\\bid=["']${id}["']`, "i").test(html)) throw new Error(`Missing ${id} in ${relativePath}`);
  }

  html = html.replace(/\s*<span[^>]+data-vlf-language-count[^>]*>[\s\S]*?<\/span>/gi, "");
  html = html.replace(/(<div\s+id="translatePanel"[^>]*>[\s\S]*?<label[^>]*>[^<]*<\/label>)/i, `$1\n    <span class="vlf-language-count" data-vlf-language-count>41 languages · ४१ भाषा</span>`);

  const iconCount = (html.match(/data-vlf-favicon=/g) || []).length;
  if (iconCount !== 3) throw new Error(`Expected 3 favicon declarations in ${relativePath}; found ${iconCount}`);
  if (!html.includes(faviconUrl)) throw new Error(`Favicon URL missing in ${relativePath}`);
  if ((html.match(/data-vlf-utility-style/g) || []).length !== 1) throw new Error(`Utility stylesheet missing or duplicated in ${relativePath}`);
  if ((html.match(/data-vlf-language-count/g) || []).length !== 1) throw new Error(`41-language badge missing or duplicated in ${relativePath}`);
  if (!/class="[^"]*\bvlf-utility-restored\b/.test(html)) throw new Error(`Restored utility class missing in ${relativePath}`);

  await writeFile(filePath, html);
  console.log(`Injected VLF favicon and restored 41-language/listen/accessibility controls in ${relativePath}`);
}

console.log(`Verified ${Object.keys(languages).length} Festival translation languages.`);
