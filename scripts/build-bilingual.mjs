import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");
const translationsPath = path.join(dist, "i18n", "mai.json");
const rootUrl = "https://videha-ejournal.github.io/videha-literature-festival/";
const englishUrl = `${rootUrl}en/`;
const today = new Date().toISOString().slice(0, 10);

const englishSource = await readFile(indexPath, "utf8");
const translations = JSON.parse(await readFile(translationsPath, "utf8"));

const decodeEntities = (value = "") => String(value)
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&nbsp;/g, " ");
const escapeHtml = (value = "") => String(value).replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]);

const languageStyle = `<style id="vlf-language-style">
.language-switch{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.48rem .78rem;border:1px solid currentColor;border-radius:999px;font-weight:700;text-decoration:none;white-space:nowrap}
.language-switch:focus-visible{outline:3px solid currentColor;outline-offset:3px}
</style>`;
const alternates = `<link rel="alternate" hreflang="mai" href="${rootUrl}">
  <link rel="alternate" hreflang="en" href="${englishUrl}">
  <link rel="alternate" hreflang="x-default" href="${rootUrl}">`;

function replaceCanonical(html, url) {
  return html.replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${url}">`);
}

function injectHead(html) {
  if (!html.includes('hreflang="mai"')) html = html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n  ${alternates}`);
  if (!html.includes('id="vlf-language-style"')) html = html.replace("</head>", `  ${languageStyle}\n</head>`);
  return html;
}

function prefixRelativeUrls(html) {
  return html.replace(/\b(href|src)="(?!https?:\/\/|\/\/|#|mailto:|tel:|data:|javascript:|\.\.\/)([^"]+)"/gi, (_, attribute, value) => `${attribute}="../${value}"`);
}

function translateStaticHtml(html) {
  const protectedBlocks = [];
  html = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (block) => {
    const token = `__VLF_PROTECTED_${protectedBlocks.length}__`;
    protectedBlocks.push(block);
    return token;
  });

  const translateValue = (raw) => {
    const decoded = decodeEntities(raw);
    const replacement = translations[decoded];
    return replacement ? escapeHtml(replacement) : raw;
  };

  html = html.split(/(<[^>]+>)/g).map((part) => {
    if (!part || part.startsWith("<")) {
      if (!part || /^<\/?(?:script|style)\b/i.test(part)) return part;
      return part.replace(/\b(aria-label|placeholder|title)="([^"]*)"/gi, (match, attribute, value) => {
        const next = translateValue(value);
        return `${attribute}="${next}"`;
      });
    }
    const leading = part.match(/^\s*/)?.[0] || "";
    const trailing = part.match(/\s*$/)?.[0] || "";
    const core = part.slice(leading.length, part.length - trailing.length || undefined);
    if (!core) return part;
    const next = translateValue(core);
    return next === core ? part : `${leading}${next}${trailing}`;
  }).join("");

  protectedBlocks.forEach((block, index) => {
    html = html.replace(`__VLF_PROTECTED_${index}__`, block);
  });
  return html;
}

const englishPathShim = `<script id="vlf-en-path-shim">
(() => {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === "string" && /^(?:\\.\\/)?(?:data|i18n)\\//.test(input)) input = "../" + input.replace(/^\\.\\//, "");
    else if (input instanceof URL && input.origin === location.origin && input.pathname.startsWith(location.pathname + "data/")) input = new URL("../data/" + input.pathname.split("/data/").pop(), location.href);
    return nativeFetch(input, init);
  };
  const fixLocalAssets = (root) => {
    if (root instanceof Element && root.matches('img[src^="assets/"]')) root.setAttribute("src", "../" + root.getAttribute("src"));
    root.querySelectorAll?.('img[src^="assets/"]').forEach((image) => image.setAttribute("src", "../" + image.getAttribute("src")));
  };
  new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach(fixLocalAssets)))
    .observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("DOMContentLoaded", () => fixLocalAssets(document));
})();
</script>`;

let english = replaceCanonical(englishSource, englishUrl);
english = english.replace(/<html\s+lang="[^"]+"/, '<html lang="en"');
english = english.replace(new RegExp(rootUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '#website', "g"), `${englishUrl}#website`);
english = english.replace(`"target": "${rootUrl}?q={search_term_string}"`, `"target": "${englishUrl}?q={search_term_string}"`);
english = english.replace(`"url": "${rootUrl}",\n        "inLanguage"`, `"url": "${englishUrl}",\n        "inLanguage"`);
english = injectHead(english);
english = prefixRelativeUrls(english);
english = english.replace(/<button id="listenBtn" type="button"><span lang="mai-Deva">सुनू<\/span> · Listen<\/button>/, '<button id="listenBtn" type="button">Listen</button>');
english = english.replace(/<button id="accessBtn" type="button"><span lang="mai-Deva">सहायक तकनीक<\/span><\/button>/, '<button id="accessBtn" type="button">Assistive Tech</button>');
english = english.replace(/<button id="readerListen"><span lang="mai-Deva">सुनू<\/span> · Listen to this introduction<\/button>/, '<button id="readerListen">Listen to this introduction</button>');
english = english.replace('<div class="utility">', `<div class="utility">\n      <a class="language-switch" href="../" hreflang="mai" lang="mai-Deva" aria-label="मैथिली संस्करण">मैथिली</a>`);
english = english.replace("</head>", `  ${englishPathShim}\n</head>`);

await mkdir(path.join(dist, "en"), { recursive: true });
await writeFile(path.join(dist, "en", "index.html"), english);

let maithili = replaceCanonical(englishSource, rootUrl);
maithili = maithili.replace(/<html\s+lang="[^"]+"/, '<html lang="mai-Deva"');
maithili = injectHead(maithili);
maithili = maithili.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="विदेह साहित्य उत्सव — पोथी, पत्रिका, प्रस्तुति, शोध आ जीवित मैथिली संस्कृतिक खोजयोग्य संगम।">');
maithili = maithili.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="विदेह साहित्य उत्सव · Videha Literature Festival">');
maithili = maithili.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="विदेह पोथी, अंक, प्रस्तुति, अनुवाद, आलोचना आ शोधक खोजयोग्य मैथिली उत्सव।">');
maithili = maithili.replace(/<meta property="og:image:alt" content="[^"]*">/, '<meta property="og:image:alt" content="विदेह साहित्य उत्सवक चित्र">');
maithili = maithili.replace(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="विदेह साहित्य उत्सव · Videha Literature Festival">');
maithili = maithili.replace(/<meta name="twitter:description" content="[^"]*">/, '<meta name="twitter:description" content="विदेह पोथी, अंक, शोध, नाटक आ साहित्यक खोजयोग्य मैथिली भेंटघाट।">');
maithili = maithili.replace(/<title>[^<]*<\/title>/, '<title>विदेह साहित्य उत्सव · Videha Literature Festival</title>');
maithili = maithili.replace('"inLanguage": ["en", "mai"]', '"inLanguage": ["mai", "en"]');
maithili = translateStaticHtml(maithili);
maithili = maithili.replace(/<button id="listenBtn" type="button"><span lang="mai-Deva">सुनू<\/span> · Listen<\/button>/, '<button id="listenBtn" type="button">सुनू</button>');
maithili = maithili.replace(/<button id="readerListen"><span lang="mai-Deva">सुनू<\/span> · Listen to this introduction<\/button>/, '<button id="readerListen">ई परिचय सुनू</button>');
maithili = maithili.replace('<div class="utility">', `<div class="utility">\n      <a class="language-switch" href="en/" hreflang="en" lang="en" aria-label="English version">English</a>`);
maithili = maithili.replace('<script src="app.js" type="module"></script>', '<script src="i18n-mai.js" type="module"></script>\n  <script src="app.js" type="module"></script>');
await writeFile(indexPath, maithili);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${rootUrl}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.00</priority>
    <xhtml:link rel="alternate" hreflang="mai" href="${rootUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${englishUrl}"/>
  </url>
  <url>
    <loc>${englishUrl}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.98</priority>
    <xhtml:link rel="alternate" hreflang="mai" href="${rootUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${englishUrl}"/>
  </url>
  <url><loc>${rootUrl}catalogue.html</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.95</priority></url>
</urlset>`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap);

const assertions = [
  [maithili.includes('<html lang="mai-Deva"'), "Maithili root language"],
  [maithili.includes(`rel="canonical" href="${rootUrl}"`), "Maithili canonical"],
  [maithili.includes('href="en/" hreflang="en"'), "Maithili → English switch"],
  [maithili.includes('src="i18n-mai.js"'), "Maithili dynamic localisation"],
  [english.includes('<html lang="en"'), "English language"],
  [english.includes(`rel="canonical" href="${englishUrl}"`), "English canonical"],
  [english.includes('href="../" hreflang="mai"'), "English → Maithili switch"],
  [english.includes('src="../app.js"'), "English shared application"],
  [english.includes('href="../styles.css"'), "English shared styles"],
  [sitemap.includes(`<loc>${englishUrl}</loc>`), "English sitemap entry"],
];
for (const [ok, label] of assertions) if (!ok) throw new Error(`Bilingual build invariant failed: ${label}`);
console.log("Built bilingual Festival: Maithili at / and English at /en/, sharing one application and corpus.");
