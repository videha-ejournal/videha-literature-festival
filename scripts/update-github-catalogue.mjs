import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const owner = "videha-ejournal";
const sources = [
  { repo: "videha-ejournal.github.io", extensions: /\.(?:html?|pdf)$/i, base: "https://videha-ejournal.github.io/", category: "GitHub book & study edition" },
  { repo: "videha-quiz", extensions: /\.pdf$/i, base: "https://videha-ejournal.github.io/videha-quiz/", category: "GitHub book & learning edition" },
  { repo: "videha", extensions: /\.pdf$/i, base: "https://videha-ejournal.github.io/videha/", category: "Videha research book" },
];
const headers = { "User-Agent": "videha-literature-festival-catalogue" };
const titleFromPath = (file) => decodeURIComponent(file.split("/").pop().replace(/\.(html?|pdf)$/i, "").replace(/^VIDEHA_/i, "").replace(/_/g, " ").replace(/\s+/g, " ").trim());
const records = [];
for (const source of sources) {
  const repo = await fetch(`https://api.github.com/repos/${owner}/${source.repo}`, { headers }).then((r) => r.json());
  const tree = await fetch(`https://api.github.com/repos/${owner}/${source.repo}/git/trees/${repo.default_branch}?recursive=1`, { headers }).then((r) => r.json());
  for (const item of tree.tree || []) {
    if (item.type !== "blob" || !source.extensions.test(item.path)) continue;
    if (/^(?:index|404)(?:\.|$)|(?:back|front)[-_ ]cover|_Level_2/i.test(item.path.split("/").pop())) continue;
    records.push({
      title: titleFromPath(item.path),
      category: source.category,
      detail: `${source.repo} · ${item.path.endsWith(".pdf") ? "PDF" : "interactive HTML"}`,
      url: source.base + item.path.split("/").map(encodeURIComponent).join("/"),
      repository: source.repo,
      path: item.path,
    });
  }
}
const unique = [...new Map(records.map((record) => [`${record.repository}|${record.path.toLowerCase()}`, record])).values()];
const out = path.resolve(import.meta.dirname, "..", "public", "data");
await mkdir(out, { recursive: true });
await writeFile(path.join(out, "github-library.json"), JSON.stringify(unique));
console.log(`Indexed ${unique.length} published GitHub book and study files.`);
