import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const maiPath = path.join(dist, "index.html");
const enPath = path.join(dist, "en", "index.html");

let maithili = await readFile(maiPath, "utf8");
let english = await readFile(enPath, "utf8");

const editions = {
  mai: {
    listenBtn: "सुनू",
    translateBtn: "अनुवाद · ४१ भाषा",
    accessBtn: "सहायक तकनीक",
    readerListen: "ई परिचय सुनू",
    languageSwitch: "English",
  },
  en: {
    listenBtn: "Listen",
    translateBtn: "Translate · 41 languages",
    accessBtn: "Assistive Tech",
    readerListen: "Listen to this introduction",
    languageSwitch: "मैथिली",
  },
};

function replaceButtonInner(html, id, label) {
  const pattern = new RegExp(`<button\\b([^>]*\\bid=["']${id}["'][^>]*)>[\\s\\S]*?<\\/button>`, "i");
  if (!pattern.test(html)) throw new Error(`Mirror normalisation: missing button #${id}`);
  return html.replace(pattern, `<button$1><span class="vlf-control-label">${label}</span></button>`);
}

function replaceLanguageSwitchInner(html, label) {
  const pattern = /<a\b([^>]*\bclass=["'][^"']*\blanguage-switch\b[^"']*["'][^>]*)>[\s\S]*?<\/a>/i;
  if (!pattern.test(html)) throw new Error("Mirror normalisation: missing language switch");
  return html.replace(pattern, `<a$1><span class="vlf-control-label">${label}</span></a>`);
}

function normaliseEdition(html, labels) {
  for (const id of ["listenBtn", "translateBtn", "accessBtn", "readerListen"]) {
    html = replaceButtonInner(html, id, labels[id]);
  }
  html = replaceLanguageSwitchInner(html, labels.languageSwitch);
  return html;
}

maithili = normaliseEdition(maithili, editions.mai);
english = normaliseEdition(english, editions.en);

await writeFile(maiPath, maithili);
await writeFile(enPath, english);

function visibleBody(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if (body == null) throw new Error("Mirror audit: missing body");
  return body
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "");
}

function attrValue(attrs, name) {
  return attrs.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] || "";
}

function structureSignature(html) {
  const tokens = [];
  const body = visibleBody(html);
  for (const match of body.matchAll(/<\/?([a-z][a-z0-9:-]*)\b([^>]*)>/gi)) {
    const raw = match[0];
    const tag = match[1].toLowerCase();
    if (raw.startsWith("</")) {
      tokens.push(`/${tag}`);
      continue;
    }
    const attrs = match[2] || "";
    const id = attrValue(attrs, "id");
    const classes = attrValue(attrs, "class").split(/\s+/).filter(Boolean).sort().join(".");
    tokens.push(`${tag}${id ? `#${id}` : ""}${classes ? `.${classes}` : ""}`);
  }
  return tokens;
}

function idSequence(html) {
  return [...visibleBody(html).matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function sectionSequence(html) {
  return [...visibleBody(html).matchAll(/<section\b[^>]*\bid=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
}

function compareSequences(a, b, label) {
  if (a.length !== b.length) throw new Error(`Bilingual mirror failed (${label} count): Maithili=${a.length}, English=${b.length}`);
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) throw new Error(`Bilingual mirror failed (${label}) at ${i}: Maithili=${a[i]} English=${b[i]}`);
  }
}

compareSequences(structureSignature(maithili), structureSignature(english), "visible DOM structure");
compareSequences(idSequence(maithili), idSequence(english), "element IDs");
compareSequences(sectionSequence(maithili), sectionSequence(english), "section order");

for (const [name, html] of [["Maithili", maithili], ["English", english]]) {
  for (const id of ["listenBtn", "translateBtn", "accessBtn", "translatePanel", "accessPanel", "language", "goTranslate", "readerListen"]) {
    if (!new RegExp(`\\bid=["']${id}["']`, "i").test(html)) throw new Error(`${name} mirror invariant: missing #${id}`);
  }
  if ((html.match(/data-vlf-language-count/g) || []).length !== 1) throw new Error(`${name} mirror invariant: 41-language badge mismatch`);
  if ((html.match(/class=["'][^"']*\blanguage-switch\b[^"']*["']/g) || []).length !== 1) throw new Error(`${name} mirror invariant: language switch mismatch`);
}

console.log(`Bilingual mirror verified: ${structureSignature(maithili).length} visible DOM nodes, ${idSequence(maithili).length} IDs, ${sectionSequence(maithili).length} ordered sections in each edition.`);
