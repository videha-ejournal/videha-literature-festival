const translationUrls = ["i18n/mai.json", "i18n/mai-extra.json"].map((file) => new URL(file, document.baseURI));
const dictionaries = await Promise.all(translationUrls.map((url) => fetch(url).then((response) => {
  if (!response.ok) throw new Error(`Unable to load Maithili translations: ${response.status}`);
  return response.json();
})));
const translations = Object.assign({}, ...dictionaries);

const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"]);
const translateExact = (value) => translations[value] || value;

function translatePatterns(value) {
  const patterns = [
    [/^Showing (\d+) of (\d+) indexed books and volumes$/, (_, shown, total) => `${shown} / ${total} सूचीबद्ध पोथी आ खण्ड देखाइत अछि`],
    [/^Showing (\d+) of (\d+) publication files$/, (_, shown, total) => `${shown} / ${total} प्रकाशन-फाइल देखाइत अछि`],
    [/^(\d+) source-linked records shown$/, (_, count) => `${count} मूल-स्रोतसँ जुड़ल अभिलेख देखाइत अछि`],
    [/^Search ([\d,]+) book and study records, 485 Videha–Sadeha files, (\d+) Rangmanch records and (\d+) world programmes\.$/, (_, books, stage, world) => `${books} पोथी आ अध्ययन-अभिलेख, ४८५ विदेह–सदेह फाइल, ${stage} रङ्गमञ्च अभिलेख आ ${world} विश्व कार्यक्रममे खोजू।`],
    [/^Archive data updated (.+)$/, (_, date) => `अभिलेख-सामग्री अद्यतन: ${date}`],
    [/^Playing collection: Part (\d+) of 12$/, (_, part) => `चलि रहल संग्रह: १२ मे भाग ${part}`],
    [/^Open Part (\d+) on Internet Archive ↗$/, (_, part) => `Internet Archive पर भाग ${part} खोलू ↗`],
    [/^Now selected: (.+)$/, (_, title) => `एखन चुनल: ${title}`],
    [/^Results for “(.+)”$/, (_, query) => `“${query}” लेल परिणाम`],
    [/^Book cover: (.+)$/, (_, title) => `पोथीक आवरण: ${title}`],
    [/^Browse (\d+) archived Videha issues$/, (_, count) => `विदेहक ${count} अभिलेखित अंक देखू`],
    [/^Browse (\d+) Sadeha issues$/, (_, count) => `सदेहक ${count} अंक देखू`],
    [/^Find the four Parallel History tomes$/, () => "समानान्तर इतिहासक चारू ग्रन्थ खोजू"],
    [/^Find the six Panji volumes$/, () => "पञ्जीक छहू खण्ड खोजू"]
  ];
  for (const [pattern, replacement] of patterns) {
    if (pattern.test(value)) return value.replace(pattern, replacement);
  }
  return value;
}

function translated(value) {
  const exact = translateExact(value);
  return exact === value ? translatePatterns(value) : exact;
}

function translateTextNode(node) {
  const raw = node.nodeValue || "";
  const trimmed = raw.trim();
  if (!trimmed) return;
  const next = translated(trimmed);
  if (next !== trimmed) node.nodeValue = raw.replace(trimmed, next);
}

function translateElement(element) {
  if (!(element instanceof Element) || skipTags.has(element.tagName)) return;
  for (const attribute of ["aria-label", "placeholder", "title"]) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const next = translated(value);
    if (next !== value) element.setAttribute(attribute, next);
  }
  for (const child of element.childNodes) translateNode(child);
}

function translateNode(node) {
  if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
  else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node);
}

function translateDocument() {
  document.documentElement.lang = "mai-Deva";
  translateElement(document.body);
}

const nativeAlert = window.alert.bind(window);
window.alert = (message) => nativeAlert(translated(String(message)));

const observer = new MutationObserver((mutations) => {
  observer.disconnect();
  for (const mutation of mutations) {
    if (mutation.type === "characterData") translateTextNode(mutation.target);
    for (const node of mutation.addedNodes) translateNode(node);
  }
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    translateDocument();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }, { once: true });
} else {
  translateDocument();
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("#goTranslate");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const target = document.querySelector("#language")?.value;
  if (!target) return;
  const url = `https://translate.google.com/translate?sl=mai&tl=${encodeURIComponent(target)}&u=${encodeURIComponent(location.href)}`;
  window.open(url, "_blank", "noopener");
}, true);
