const A11Y_MEDIA_VERSION = "20260913";

const addParam = (url, key, value) => {
  try {
    const u = new URL(url, location.href);
    u.searchParams.set(key, value);
    return u.toString();
  } catch { return url; }
};

function youtubeSource(src) {
  try {
    const u = new URL(src, location.href);
    if (!/youtube(?:-nocookie)?\.com$/.test(u.hostname)) return null;
    const playlist = u.searchParams.get("list");
    const series = u.pathname.includes("/embed/videoseries");
    if (series && playlist) return `https://www.youtube.com/playlist?list=${encodeURIComponent(playlist)}`;
    const id = u.pathname.match(/\/embed\/([^/?]+)/)?.[1];
    return id ? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}` : null;
  } catch { return null; }
}

function enhanceYoutubeFrame(frame) {
  if (!frame?.src || !/youtube(?:-nocookie)?\.com\/embed\//.test(frame.src)) return;
  const next = addParam(addParam(addParam(frame.src, "cc_load_policy", "1"), "rel", "0"), "hl", document.documentElement.lang?.startsWith("mai") ? "hi" : "en");
  if (next !== frame.src) frame.src = next;
  frame.loading = "lazy";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  const describedBy = frame.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) || [];
  if (!describedBy.includes("mediaAccessibilityHelp")) describedBy.push("mediaAccessibilityHelp");
  frame.setAttribute("aria-describedby", describedBy.join(" "));
}

function enhanceArchiveFrame(frame) {
  if (!frame?.src || !/archive\.org\/embed\//.test(frame.src)) return;
  frame.loading = "lazy";
  const describedBy = frame.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) || [];
  if (!describedBy.includes("mediaAccessibilityHelp")) describedBy.push("mediaAccessibilityHelp");
  frame.setAttribute("aria-describedby", describedBy.join(" "));
}

function insertMediaHelp() {
  if (document.getElementById("mediaAccessibilityHelp")) return;
  const host = document.querySelector("#media, #stages, #reader, main");
  if (!host) return;
  const box = document.createElement("aside");
  box.id = "mediaAccessibilityHelp";
  box.className = "media-accessibility-panel";
  box.setAttribute("aria-labelledby", "mediaAccessibilityTitle");
  box.innerHTML = `
    <h2 id="mediaAccessibilityTitle">Media accessibility · captions and transcripts</h2>
    <p>YouTube players request captions by default. Use the player <strong>CC</strong> control when captions exist; on the source YouTube page, use <strong>Show transcript</strong> when that option is supplied by the host. Internet Archive caption, subtitle or transcript files remain controlled by the source item.</p>
    <p><strong>Editorial rule:</strong> Videha does not label a programme “transcribed” unless a verified transcript is actually available. Programme notes and titles are descriptive alternatives, not verbatim transcripts.</p>
    <p class="media-accessibility-actions"><a href="accessibility/media/">Media accessibility register</a> · <a href="accessibility/transcripts/">Verified transcript index</a> · <a href="accessibility/">Accessibility statement</a></p>`;
  host.insertAdjacentElement("afterbegin", box);
}

function insertPlayerSourceLink() {
  const player = document.getElementById("rangmanchPlayer");
  if (!player || document.getElementById("rangmanchAccessibleSource")) return;
  const p = document.createElement("p");
  p.className = "media-source-a11y";
  p.id = "rangmanchAccessibleSource";
  const a = document.createElement("a");
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "Open source for captions / transcript options ↗";
  p.append(a);
  player.insertAdjacentElement("afterend", p);
  const sync = () => {
    const source = youtubeSource(player.src);
    if (source) { a.href = source; p.hidden = false; }
    else { p.hidden = true; a.removeAttribute("href"); }
  };
  new MutationObserver(sync).observe(player, { attributes:true, attributeFilter:["src"] });
  sync();
}

function addAccessibleArchiveLinks() {
  document.querySelectorAll(".issue-card").forEach(card => {
    if (card.querySelector(".accessible-record-link")) return;
    const marker = card.querySelector(".issue-no")?.textContent || "";
    const m = marker.match(/(VIDEHA|SADEHA)\s*·\s*(\d+)(?:\s*·\s*VERSION\s*(\d+))?/i);
    if (!m) return;
    const publication = m[1].toLowerCase();
    const issue = String(Number(m[2])).padStart(3, "0");
    const version = m[3] ? `-v${m[3]}` : "";
    const link = document.createElement("a");
    link.className = "accessible-record-link";
    link.href = `accessible-archive/${publication}-${issue}${version}/`;
    link.textContent = "Accessible issue record ↗";
    card.append(link);
  });
}

function monitorDynamicMedia() {
  const apply = root => {
    root.querySelectorAll?.('iframe[src*="youtube.com/embed/"],iframe[src*="youtube-nocookie.com/embed/"]').forEach(enhanceYoutubeFrame);
    root.querySelectorAll?.('iframe[src*="archive.org/embed/"]').forEach(enhanceArchiveFrame);
  };
  apply(document);
  new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.target instanceof HTMLIFrameElement) apply(mutation.target.parentElement || document);
      mutation.addedNodes.forEach(node => { if (node.nodeType === 1) apply(node); });
    }
    addAccessibleArchiveLinks();
  }).observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:["src"] });
}

function initMediaAccessibility() {
  insertMediaHelp();
  insertPlayerSourceLink();
  addAccessibleArchiveLinks();
  monitorDynamicMedia();
  document.documentElement.dataset.mediaA11y = A11Y_MEDIA_VERSION;
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMediaAccessibility, {once:true});
else initMediaAccessibility();
