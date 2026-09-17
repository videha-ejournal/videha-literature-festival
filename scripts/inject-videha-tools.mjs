import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const marker = "<!-- VIDEHA_CANONICAL_AI_ACCESS_TOOLS -->";

const style = `${marker}
<style id="videha-canonical-tools-style">
  .videha-canonical-tools{
    position:sticky;top:0;z-index:9800;display:flex;align-items:center;justify-content:center;
    flex-wrap:wrap;gap:8px;width:100%;box-sizing:border-box;margin:0;padding:8px 12px;
    background:#FAF6EE;border-bottom:1px solid #D8CFC0;box-shadow:0 2px 8px rgba(31,42,68,.08);
    color:#23201B;font-family:"Noto Sans Devanagari",Inter,system-ui,sans-serif;
  }
  .videha-canonical-tools .videha-tts-btn{
    display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:6px 12px;
    border:1px solid #C49A3C;border-radius:20px;background:#FAF6EE;color:#8B1A1A;
    cursor:pointer;font:600 14px/1.4 "Noto Sans Devanagari",Inter,system-ui,sans-serif;
  }
  .videha-canonical-tools .videha-tts-btn:hover,
  .videha-canonical-tools .videha-tts-btn:focus-visible{
    background:#8B1A1A;color:#FAF6EE;border-color:#8B1A1A;
  }
  .videha-canonical-tools .videha-sr-only{
    position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
    clip:rect(0 0 0 0);white-space:nowrap;border:0;
  }
  .utility > #listenBtn,.utility > #translateBtn,.utility > #accessBtn{display:none!important}
  @media(max-width:600px){
    .videha-canonical-tools{justify-content:flex-start;overflow:visible;padding:7px 8px}
    .videha-canonical-tools .videha-tts-btn{font-size:13px;padding:5px 10px}
  }
</style>`;

const toolbar = `<div class="videha-a11y-bar videha-ai-standalone videha-canonical-tools" role="region" aria-label="पृष्ठ सुनू, ए.आइ. अनुवाद आ सहायक तकनीक · Listen, AI Translate and Assistive Tech" data-pagefind-ignore="all">
  <button type="button" id="videha-tts-toggle" class="videha-tts-btn" aria-pressed="false" aria-label="ई पृष्ठ सुनू · Listen to this page"><span class="videha-tts-ic" aria-hidden="true">🔊</span><span class="videha-tts-label">सुनू · Listen</span></button>
  <button type="button" id="videha-tts-stop" class="videha-tts-btn videha-tts-stop" hidden aria-label="वाचन रोकू · Stop reading"><span class="videha-tts-ic" aria-hidden="true">⏹</span><span class="videha-tts-label">रोकू · Stop</span></button>
  <span id="videha-tts-status" class="videha-sr-only" role="status" aria-live="polite"></span>
</div>`;

const scripts = `<script src="https://videha-ejournal.github.io/videha/assets/js/videha-tts.js?v=20260818-hostfix2" defer data-videha-tool="listen"></script>
<script src="https://videha-ejournal.github.io/videha/assets/js/videha-translate.js?v=20260827" defer data-videha-tool="translate-41"></script>
<script src="https://videha-ejournal.github.io/videha/assets/js/videha-access.js?v=20260827" defer data-videha-tool="assistive-tech"></script>`;

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(target));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(target);
  }
  return files;
}

function inject(html) {
  if (html.includes(marker) || html.includes('id="videha-tts-toggle"')) return html;

  if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, `${style}\n</head>`);
  else html = `${style}\n${html}`;

  if (/<body\b[^>]*>/i.test(html)) {
    html = html.replace(/(<body\b[^>]*>)/i, `$1\n${toolbar}`);
  } else {
    html = `${toolbar}\n${html}`;
  }

  if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, `${scripts}\n</body>`);
  else html += `\n${scripts}\n`;

  return html;
}

const files = await htmlFiles(dist);
let changed = 0;
for (const file of files) {
  const before = await readFile(file, "utf8");
  const after = inject(before);
  if (after !== before) {
    await writeFile(file, after);
    changed += 1;
  }
}

console.log(`Injected canonical Videha Listen + 41-language AI Translate + Assistive Tech toolbar into ${changed}/${files.length} generated HTML pages.`);
