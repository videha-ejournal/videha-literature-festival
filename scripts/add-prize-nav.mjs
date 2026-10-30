import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public");
const links = [
  ["Nepal Prajna Pratishthan", "nepal-prajna/", "नेपाल प्रज्ञा प्रतिष्ठान"],
  ["Madan Puraskar", "madan-puraskar/", "मदन पुरस्कार"],
  ["Vidyapati Kosh Puraskar", "vidyapati-kosh/", "विद्यापति कोष पुरस्कार"],
  ["Nepal Sajha Prakashan", "nepal-sajha/", "नेपाल साझा प्रकाशन"],
  ["Other Prizes", "other-prizes/", "आन पुरस्कार"]
];

async function files(dir) {
  const out = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await files(file));
    else if (ent.name.endsWith(".html")) out.push(file);
  }
  return out;
}

for (const file of await files(root)) {
  let html = await readFile(file, "utf8");
  if (html.includes("data-vlf-prize-nav")) continue;
  const isMai = file.includes(`${path.sep}mai${path.sep}`);
  const nav = `<nav data-vlf-prize-nav aria-label="${isMai ? "पुरस्कार पृष्ठ" : "Prize pages"}" style="max-width:1200px;margin:28px auto;padding:14px 22px;border-top:1px solid currentColor;border-bottom:1px solid currentColor;display:flex;flex-wrap:wrap;gap:10px"><strong>${isMai ? "पुरस्कार पृष्ठ:" : "Prize pages:"}</strong>${links.map(([en, slug, mai]) => `<a href="https://videha-ejournal.github.io/videha-literature-festival/${isMai ? "mai/" : ""}${slug}">${isMai ? mai : en}</a>`).join(" · ")}</nav>`;
  html = html.replace(/<\/body>/i, `${nav}</body>`);
  await writeFile(file, html);
}
console.log("Prize navigation added to all public HTML pages.");
