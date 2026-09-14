import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const faviconAsset = path.join(dist, "assets", "vlf-logo.png");
const faviconUrl = "https://videha-ejournal.github.io/videha-literature-festival/assets/vlf-logo.png";
const faviconLinks = [
  `<link rel="icon" type="image/png" href="${faviconUrl}" data-vlf-favicon="icon">`,
  `<link rel="shortcut icon" type="image/png" href="${faviconUrl}" data-vlf-favicon="shortcut">`,
  `<link rel="apple-touch-icon" href="${faviconUrl}" data-vlf-favicon="apple-touch">`,
].join("\n  ");

await access(faviconAsset);

for (const relativePath of ["index.html", path.join("en", "index.html")]) {
  const filePath = path.join(dist, relativePath);
  let html = await readFile(filePath, "utf8");

  html = html.replace(/\n\s*<link[^>]+data-vlf-favicon="[^"]+"[^>]*>/g, "");
  if (!/<head\b[^>]*>/i.test(html)) throw new Error(`Missing <head> in ${relativePath}`);

  const viewport = /(<meta\s+name="viewport"[^>]*>)/i;
  if (viewport.test(html)) html = html.replace(viewport, `$1\n  ${faviconLinks}`);
  else html = html.replace(/<head\b[^>]*>/i, (head) => `${head}\n  ${faviconLinks}`);

  const iconCount = (html.match(/data-vlf-favicon=/g) || []).length;
  if (iconCount !== 3) throw new Error(`Expected 3 favicon declarations in ${relativePath}; found ${iconCount}`);
  if (!html.includes(faviconUrl)) throw new Error(`Favicon URL missing in ${relativePath}`);

  await writeFile(filePath, html);
  console.log(`Injected VLF favicon metadata into ${relativePath}`);
}
