const BASE = "https://videha-ejournal.github.io/videha-literature-festival/";
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];
const esc = (v="") => String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const devToLat = s => String(s).replace(/[०-९]/g,d=>"०१२३४५६७८९".indexOf(d));
const aliases = new Map([
  ["vidyapati","विद्यापति"],["विद्यापति","vidyapati"],["gajendra thakur","गजेन्द्र ठाकुर"],["गजेन्द्र ठाकुर","gajendra thakur"],
  ["maithili","मैथिली"],["मैथिली","maithili"],["mithila","मिथिला"],["मिथिला","mithila"],["panji","पञ्जी पंजी"],["पञ्जी","panji पंजी"],["पंजी","panji पञ्जी"],
  ["videha","विदेह"],["विदेह","videha"],["sadeha","सदेह"],["सदेह","sadeha"],["theatre","नाटक रंगमंच"],["नाटक","theatre rangmanch"]
]);
const termsFor = raw => {
  const q = devToLat(String(raw||"").trim().toLowerCase());
  const extra = aliases.get(q) || "";
  return [q,...String(extra).toLowerCase().split(/\s+/)].filter(Boolean);
};
const matches = (haystack, terms) => {
  const h = devToLat(String(haystack||"").toLowerCase());
  return terms.some(t=>h.includes(t));
};

let manifest = null;
let dataPromise = null;
async function getData(){
  if(dataPromise) return dataPromise;
  dataPromise = Promise.all([
    fetch("data/archive.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).catch(()=>null),
    fetch("data/pothi.json").then(r=>r.ok?r.json():[]).catch(()=>[]),
    fetch("data/github-library.json").then(r=>r.ok?r.json():[]).catch(()=>[])
  ]).then(([archive,pothi,github])=>({archive,pothi,github}));
  return dataPromise;
}

function addLanguageSwitch(){
  const utility=$(".utility"); if(!utility || $(".language-switch")) return;
  const nav=document.createElement("nav"); nav.className="language-switch"; nav.setAttribute("aria-label","Language");
  nav.innerHTML='<a href="./" lang="en" aria-current="page">English</a><a href="mai/" lang="mai">मैथिली</a>';
  utility.prepend(nav);
}
function addCurrentIssue(data){
  if(!data || $(".current-issue-card")) return;
  const hero=$(".hero"); if(!hero) return;
  const card=document.createElement("section"); card.className="current-issue-card"; card.setAttribute("aria-labelledby","currentIssueTitle");
  const n=data.currentIssue||"—"; const date=data.currentIssueDate||"Latest live issue";
  card.innerHTML=`<div><p class="eyebrow">CURRENT VIDEHA · LIVE FORTNIGHTLY ISSUE</p><h2 id="currentIssueTitle">Videha Issue ${esc(n)} <span lang="mai">· विदेह अंक ${esc(n)}</span></h2><p>${esc(date)} · ISSN 2229-547X</p><p>The PDF archive currently runs through Issue ${esc(data.archiveMaxVideha)}; the live journal remains the source of truth for the newest issue.</p></div><div class="current-issue-actions"><a href="https://videha-ejournal.github.io/videha/">Read current issue ↗</a><a href="#issues">Browse archive ↓</a></div>`;
  hero.insertAdjacentElement("afterend",card);
}
function addWayfinding(){
  const anchor=$(".stats")||$(".four-doors"); if(!anchor) return;
  if(!$(".audience-shortcuts")){
    const nav=document.createElement("nav"); nav.className="audience-shortcuts"; nav.setAttribute("aria-label","Choose by activity");
    nav.innerHTML='<strong>Start by activity:</strong><a href="#books">Read</a><a href="#issues">Research</a><a href="#rangmanchArchive">Watch / Listen</a>';
    anchor.insertAdjacentElement("afterend",nav);
  }
  if(!$(".section-hubs")){
    const nav=document.createElement("nav"); nav.className="section-hubs"; nav.setAttribute("aria-label","Permanent festival sections");
    nav.innerHTML='<strong>Section pages:</strong><a href="books/">Books</a><a href="issues/">Issues</a><a href="stages/">Stages</a><a href="theatre/">Theatre</a><a href="criticism/">Criticism</a><a href="world-exchange/">World Exchange</a><a href="media/">Media</a><a href="about/">About</a>';
    $(".four-doors")?.insertAdjacentElement("afterend",nav);
  }
}
function updateCounts(data){
  if(!data) return;
  const v=$("#videhaCount"); if(v) v.textContent=data.archiveMaxVideha;
  const vp=v?.closest("a"); if(vp) vp.setAttribute("aria-label",`Browse ${data.archiveMaxVideha} archived Videha issues; current live issue ${data.currentIssue}`);
  const s=$('[data-issue-publication="SADEHA"]');
  if(s){ const strong=$("strong",s), span=$("span",s); if(strong) strong.textContent=data.archiveSadehaIssues||37; if(span) span.textContent=`Sadeha issues · ${data.archiveSadehaDocuments||38} preserved files`; }
  const status=$("#searchStatus");
  if(status){ const base=status.textContent.replace(/\d+\s+Videha–Sadeha files/,`${data.preservedArchiveFiles||data.archive?.length||485} Videha–Sadeha files`); status.textContent=base; }
}
function addFollow(data){
  const footer=$("footer"); if(!footer || $(".follow-videha")) return;
  const block=document.createElement("section"); block.className="follow-videha"; block.setAttribute("aria-labelledby","followVidehaTitle");
  block.innerHTML=`<p class="eyebrow">NEW VIDEHA ISSUE · TWICE MONTHLY</p><h2 id="followVidehaTitle">Follow Videha</h2><p>Continue from the festival into the living journal${data?.currentIssue?` · current Issue ${esc(data.currentIssue)}`:""}.</p><nav aria-label="Follow Videha"><a href="https://videha-ejournal.github.io/videha/">Current issue</a><a href="https://groups.google.com/g/videha">Email subscription ↗</a><a href="https://www.videha.co.in/videha-rss.xml">RSS feed ↗</a><a href="#issues">Festival archive</a></nav>`;
  footer.insertAdjacentElement("beforebegin",block);
  if(!$("footer a[href='accessibility/']")) footer.insertAdjacentHTML("afterbegin",'<a href="accessibility/">Accessibility statement</a><a href="mai/" lang="mai">मैथिली</a>');
}
function tuneAccessibility(){
  const translate=$("#translateBtn"); if(translate) translate.textContent="Translate page";
  $$('img:not([loading])').forEach((img,i)=>{if(i>0) img.loading="lazy"; img.decoding="async";});
  $$('iframe').forEach(frame=>{frame.loading="lazy";});
  $$('a[target="_blank"]').forEach(a=>{
    if(!/opens in new tab/i.test(a.getAttribute("aria-label")||"")) a.setAttribute("aria-label",`${a.textContent.trim()} (opens in new tab)`);
  });
  ["archivePlayer","rangmanchPlayer"].forEach(id=>{
    const frame=document.getElementById(id); if(!frame || frame.nextElementSibling?.classList.contains("a11y-media-note")) return;
    const p=document.createElement("p");p.className="a11y-media-note";p.innerHTML='Captions and transcripts depend on the source recording. Use the player’s CC controls when available, or open the source page for accessibility options.';frame.insertAdjacentElement("afterend",p);
  });
  const triggers=[["#translateBtn","#translatePanel"],["#accessBtn","#accessPanel"]];
  triggers.forEach(([b,p])=>{const btn=$(b),panel=$(p);if(!btn||!panel)return;btn.setAttribute("aria-expanded",String(!panel.hidden));btn.setAttribute("aria-controls",panel.id);btn.addEventListener("click",()=>queueMicrotask(()=>btn.setAttribute("aria-expanded",String(!panel.hidden))));});
  let searchOpener=null;
  $("#globalSearchForm")?.addEventListener("submit",()=>{searchOpener=document.activeElement;},{capture:true});
  $("#closeSearch")?.addEventListener("click",()=>setTimeout(()=>searchOpener?.focus?.(),0));
  document.addEventListener("keydown",e=>{
    if(e.key!=="Escape") return;
    const dialog=$("#searchDialog");
    if(dialog && !dialog.hidden){dialog.hidden=true;document.body.style.overflow="";searchOpener?.focus?.();return;}
    $$(".panel").forEach(p=>p.hidden=true); triggers.forEach(([b])=>$(b)?.setAttribute("aria-expanded","false"));
    const menu=$("#primary-nav");if(menu?.classList.contains("open")){menu.classList.remove("open");$(".menu-toggle")?.setAttribute("aria-expanded","false");$(".menu-toggle")?.focus();}
  });
  $("#searchDialog")?.addEventListener("keydown",e=>{
    if(e.key!=="Tab")return; const dialog=e.currentTarget; const focusable=$$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',dialog).filter(x=>!x.hidden&&!x.disabled);
    if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
}

const scopeLabels={all:"All",books:"Books",videha:"Videha",sadeha:"Sadeha",authors:"Authors",theatre:"Theatre",media:"Audio / Video",world:"World"};
let activeScope="all", activeSort="relevance";
function setupSearchTools(){
  const results=$("#searchResults"); if(!results || $(".search-tools")) return;
  const tools=document.createElement("div"); tools.className="search-tools";
  tools.innerHTML=`<div class="search-scope" role="group" aria-label="Search scope">${Object.entries(scopeLabels).map(([k,v])=>`<button type="button" data-scope="${k}" aria-pressed="${k==='all'}" class="${k==='all'?'active':''}">${v}</button>`).join("")}</div><div class="search-tools-row"><p class="search-count" aria-live="polite">Choose a scope or sort order.</p><label>Sort <select id="enhancedSort"><option value="relevance">Relevance</option><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="az">A–Z</option></select></label><button type="button" class="clear-search">Clear search</button></div>`;
  results.insertAdjacentElement("beforebegin",tools);
  tools.addEventListener("click",e=>{const b=e.target.closest("[data-scope]");if(b){activeScope=b.dataset.scope;$$('[data-scope]',tools).forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',on)});runEnhancedSearch($("#globalSearch")?.value||"");}if(e.target.closest('.clear-search')){const input=$("#globalSearch");if(input)input.value='';$("#searchDialog").hidden=true;document.body.style.overflow='';history.replaceState({},'',location.pathname+location.hash);input?.focus();}});
  $("#enhancedSort",tools)?.addEventListener("change",e=>{activeSort=e.target.value;runEnhancedSearch($("#globalSearch")?.value||"");});
}
function staticResults(qTerms){
  const rows=[];
  $$(".world-program-link").forEach(a=>{if(matches(`${a.dataset.genre||''} ${a.textContent}`,qTerms))rows.push({scope:'world',kind:'World programme',title:$("b",a)?.textContent||a.textContent.trim(),desc:$("span",a)?.textContent||'Official external programme',url:a.href});});
  $$("#rangmanchGrid a, #rangmanchGrid button").forEach(a=>{const text=a.textContent.trim();if(text&&matches(text,qTerms))rows.push({scope:'theatre',kind:'Theatre',title:text,desc:'Videha Rangmanch record',url:a.href||'#rangmanchArchive'});});
  $$(".media-grid a").forEach(a=>{if(matches(a.textContent,qTerms))rows.push({scope:'media',kind:'Audio / Video',title:$("h3",a)?.textContent||a.textContent.trim(),desc:$("p",a)?.textContent||'Videha media collection',url:a.href});});
  $$("#stages article, #stages .stage, #stages .stage-card").forEach(a=>{if(matches(a.textContent,qTerms))rows.push({scope:/rangmanch|theatre|नाटक/i.test(a.textContent)?'theatre':'all',kind:'Stage',title:$("h3",a)?.textContent||'Festival stage',desc:$("p",a)?.textContent||a.textContent.trim(),url:'#stages'});});
  return rows;
}
async function collectResults(raw){
  const qTerms=termsFor(raw); if(!qTerms.length)return[];
  const {archive,pothi,github}=await getData(); manifest=archive||manifest;
  const rows=[];
  (pothi||[]).forEach(x=>{if(matches(`${x.title} ${x.author||''}`,qTerms))rows.push({scope:'books',kind:'Book',title:x.title,desc:`Videha Pothi${x.author?` · ${x.author}`:''}`,url:x.url||'https://www.videha.co.in/pothi.htm'});});
  (github||[]).forEach(x=>{if(matches(`${x.title||''} ${x.category||''} ${x.detail||''}`,qTerms))rows.push({scope:'books',kind:'Book',title:x.title||'GitHub edition',desc:`GitHub edition${x.category?` · ${x.category}`:''}`,url:x.url||'#books'});});
  const authorMap=new Map();(pothi||[]).forEach(x=>{const a=(x.author||'').trim();if(a&&matches(a,qTerms)&&!authorMap.has(a)){authorMap.set(a,true);rows.push({scope:'authors',kind:'Author',title:a,desc:'Author in the verified Videha Pothi catalogue',url:`${BASE}?q=${encodeURIComponent(a)}#books`});}});
  (archive?.archive||[]).forEach(x=>{if(matches(`${x.publication} ${x.issue} ${x.title} ${x.date||''} ${x.year||''}`,qTerms))rows.push({scope:x.publication==='SADEHA'?'sadeha':'videha',kind:'Issue',title:x.title,desc:`${x.publication} ${x.issue} · ${x.date||'undated'}`,url:x.source,date:x.dateISO||''});});
  rows.push(...staticResults(qTerms));
  const seen=new Set();return rows.filter(r=>{const k=`${r.scope}|${r.title}|${r.url}`;if(seen.has(k))return false;seen.add(k);return true;});
}
function renderEnhanced(rows,raw){
  const filtered=activeScope==='all'?rows:rows.filter(r=>r.scope===activeScope || (activeScope==='books'&&r.scope==='authors'));
  const sorted=[...filtered];
  if(activeSort==='az')sorted.sort((a,b)=>a.title.localeCompare(b.title,['mai','en'],{numeric:true,sensitivity:'base'}));
  if(activeSort==='newest')sorted.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(activeSort==='oldest')sorted.sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
  const out=$("#searchResults"); if(!out)return;
  out.innerHTML=sorted.length?sorted.slice(0,160).map(x=>`<article class="search-result" data-scope="${esc(x.scope)}" data-date="${esc(x.date||'')}"><span class="kind">${esc(x.kind)}</span><div><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p></div><a href="${esc(x.url)}" ${/^https?:/.test(x.url)?'target="_blank" rel="noopener"':''}>Open ↗</a></article>`).join(''):'<p>No matching records were found in this scope.</p>';
  $("#searchDialogTitle").textContent=`Results for “${raw}”`;
  $(".search-count") && ($(".search-count").textContent=`${filtered.length.toLocaleString('en-IN')} result${filtered.length===1?'':'s'} · ${scopeLabels[activeScope]}`);
  $("#searchDialog").hidden=false;document.body.style.overflow='hidden';$("#closeSearch")?.focus();
  const u=new URL(location.href);u.searchParams.set('q',raw);if(activeScope==='all')u.searchParams.delete('type');else u.searchParams.set('type',activeScope);if(activeSort==='relevance')u.searchParams.delete('sort');else u.searchParams.set('sort',activeSort);history.replaceState({},'',u);
}
async function runEnhancedSearch(raw){raw=String(raw||'').trim();if(!raw)return;const rows=await collectResults(raw);renderEnhanced(rows,raw);}
function installEnhancedSearch(){
  setupSearchTools();
  const form=$("#globalSearchForm");if(!form)return;
  form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();runEnhancedSearch($("#globalSearch")?.value||'');},{capture:true});
  const params=new URLSearchParams(location.search);const scope=params.get('type'),sort=params.get('sort');if(scopeLabels[scope])activeScope=scope;if(['relevance','newest','oldest','az'].includes(sort))activeSort=sort;
  const tools=$(".search-tools"); if(tools){$$('[data-scope]',tools).forEach(b=>{const on=b.dataset.scope===activeScope;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)});const sel=$("#enhancedSort",tools);if(sel)sel.value=activeSort;}
  const requested=params.get('q');if(requested){const input=$("#globalSearch");if(input)input.value=requested;setTimeout(()=>runEnhancedSearch(requested),700);}
}

async function initEnhancements(){
  addLanguageSwitch(); addWayfinding(); tuneAccessibility(); installEnhancedSearch();
  const {archive}=await getData(); manifest=archive; if(archive){updateCounts(archive);addCurrentIssue(archive);} addFollow(archive);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initEnhancements,{once:true});else initEnhancements();
