const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const archiveUrl = "https://www.videha.co.in/";

const parallelTomes = [
  { title: "A Parallel History of Mithila & Maithili Literature — Tome I", range: "Volumes 1–25", url: "https://videha-ejournal.github.io/VIDEHA_PARALLEL_HISTORY_TOME_I.html" },
  { title: "A Parallel History of Mithila & Maithili Literature — Tome II", range: "Volumes 26–50", url: "https://videha-ejournal.github.io/VIDEHA_PARALLEL_HISTORY_TOME_II.html" },
  { title: "A Parallel History of Mithila & Maithili Literature — Tome III", range: "Volumes 51–75", url: "https://videha-ejournal.github.io/VIDEHA_PARALLEL_HISTORY_TOME_III.html" },
  { title: "A Parallel History of Mithila & Maithili Literature — Tome IV", range: "Volumes 76–100", url: "https://videha-ejournal.github.io/VIDEHA_PARALLEL_HISTORY_TOME_IV.html" },
];
const panjiLinks = [
  "https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila/",
  "https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila-volume-ii/",
  "https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila-volume-iii/",
  "https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila-volume-iv/",
  "https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila-volume-v/",
  "https://www.videha.co.in/gajendra-thakur-samagra.htm",
];
const childTitles = ["Tarhari Me Pari Lok","Bal Guru","Deena Bhadari","Amar Baba","Moti Dai","Raja Salhes","Bagiyak Gach","Bahura Godhin Natua Dayal","Chauharmal aa Reshma","Mahua Ghatwarin","Chechan","Gariban Baba","Varnamala Shiksha Ankita","Gangodevik Bhagta","Miran Sahab","Jat-Jatin","Lalmain Baba","Munga–Jalim Singh","Bad Sukh Saar Paol Tua Teere","Battu","Bhat–Bhatin","Bihula","Brahman aa Thakurak Katha","Daku Rauhineya","Doki–Doka","Gonu Jha and Das Thop Baba","Jyoti Panjiyar","Kauwa aa Fuddi","Madhav Singh: Amta Gaam","Motisaeri","Murkhadhiraj","Naika Banijara","Raghuni Marar","Raja Ansari","Raja Dholan","Ugna","Ootani"];
const playTitles = ["Apala Atreyi","Bhaa Jaeb Chhu","Danveer Dadhichi","Ganga Bridge","Jalodeep","Kamalak Bhagata","Machanda","Sankarshan","Ulkamukh"];

const books = parallelTomes.map((tome) => ({ title: tome.title, category: "Parallel History", detail: `${tome.range} · cumulative literary history`, url: tome.url }));
for (let i = 1; i <= 6; i++) books.push({ title: `Decoding the Panji of Mithila — Volume ${["I","II","III","IV","V","VI"][i-1]}`, category: "Panji", detail: "Genealogy, manuscript practice and social history", url: panjiLinks[i-1] });
childTitles.forEach((title, i) => books.push({ title, category: "Children’s literature", detail: `Illustrated Maithili children’s novel ${i + 1} of 37`, url: "https://archive.org/download/videha-petar-2/37_MAITHILI%20NOVELS.pdf" }));
playTitles.forEach(title => books.push({ title, category: "Theatre", detail: "Maithili and English illustrated stage-play editions", url: "https://www.videha.co.in/Audio_Video.htm" }));
[
  ["Gajendra Thakur’s Parallel Philosophy", "Philosophy", "Pūrvapakṣa, uttarapakṣa and comparative philosophical inquiry"],
  ["A History of Mithila, Vajji & Anga — Volume I", "History", "General and political history"],
  ["A History of Mithila, Vajji & Anga — Volume II", "History", "Social, cultural and economic history"],
  ["Ātmatattvaviveka — English translation", "Sanskrit translation", "Udayana’s inquiry into the nature of self"],
  ["Bhāmatī — English translation", "Sanskrit translation", "Vācaspati Miśra’s Advaita commentary"],
  ["Nyāyakusumāñjali — English translation", "Sanskrit translation", "Udayana’s Nyāya argumentation"],
  ["Tattvacintāmaṇi — English translation", "Sanskrit translation", "Gaṅgeśa’s foundational Navya-Nyāya text"],
  ["Maithili Thesaurus", "Language", "A cumulative Maithili reference work"],
  ["Maithili Grammar", "Language", "Grammar and language study"],
  ["Rang Sangam", "Theatre", "Nine illustrated plays in Maithili and English"],
  ["Gajendra Thakur Samagra", "Collected works", "Collected creative, critical, historical and translated writings"],
].forEach(([title, category, detail]) => books.push({ title, category, detail, url: category === "History" ? "https://videha-ejournal.github.io/mithila-vajji-anga/" : "https://www.videha.co.in/gajendra-thakur-samagra.htm" }));

const covers = [
  ["decoding-the-panji.webp", "Decoding the Panji of Mithila I"], ["decoding-panji-ii-front.webp", "Decoding the Panji II"], ["decoding-panji-vol-iii-spread.webp", "Decoding the Panji III"], ["decoding-panji-vol-iv-spread.webp", "Decoding the Panji IV"], ["decoding-panji-vol-v-spread.webp", "Decoding the Panji V"], ["decoding-panji-vi-front.webp", "Decoding the Panji VI"], ["mithila-parallel-history-front-cover-6x9.webp", "A Parallel History"], ["parallel-philosophy-front-cover-6x9.webp", "Parallel Philosophy"], ["atmatattvaviveka-front-cover-en.webp", "Ātmatattvaviveka"], ["bhamati-front-cover-en.webp", "Bhāmatī"], ["nyaya-kusumanjali-front-cover-en.webp", "Nyāyakusumāñjali"], ["tattvacintamani-front-cover-en.webp", "Tattvacintāmaṇi"], ["cover-front.webp", "History of Mithila, Vajji & Anga"]
];

const stages = [
  {title:"Kavita Sabha", kicker:"POETRY", text:"Poetry across the current journal, historic issues, collected verse and audio recitation.", href:"https://www.videha.co.in/pothi.htm", link:"Enter the poetry shelves"},
  {title:"Rangmanch", kicker:"THEATRE", text:"Nine bilingual illustrated plays, dramatic writing, stage traditions and recorded performance.", href:"https://www.videha.co.in/Audio_Video.htm", link:"Open theatre and performance"},
  {title:"Shishu Utsav", kicker:"YOUNG READERS", text:"Thirty-seven illustrated novels, stories, quizzes and learning material for children and adolescents.", href:"https://www.videha.co.in/kids.htm", link:"Visit Shishu Utsav"},
  {title:"Anuvad Manch", kicker:"TRANSLATION", text:"Sanskrit philosophical texts, multilingual literary translation and the movement between Maithili, English and scripts.", href:"https://www.videha.co.in/pothi.htm", link:"Explore translation"},
  {title:"Samiksha Kaksh", kicker:"CRITICISM", text:"Author criticism, literary historiography, forgotten writers and arguments about the Maithili canon.", href:"https://www.videha.co.in/gajenthakur.htm", link:"Read Parallel History"},
  {title:"Archive Assembly", kicker:"PUBLIC MEMORY", text:"Issue-by-issue discovery across 447 archived Videha issues and 37 Sadeha compilations.", href:"#issues", link:"Search the periodicals"},
];

let issueRecords = [];
let bookLimit = 24;
let issueLimit = 30;

function renderCovers(){ $("#coverRail").innerHTML = covers.map(([src,title]) => `<article class="cover-card"><img src="assets/${encodeURI(src)}" alt="Book cover: ${title}" loading="lazy"><span>${title}</span></article>`).join(""); }
function renderStages(){ $("#stageGrid").innerHTML = stages.map(s => `<article class="stage-card"><p class="eyebrow">${s.kicker}</p><h3>${s.title}</h3><p>${s.text}</p><a href="${s.href}">${s.link} ↗</a></article>`).join(""); }
function renderBooks(reset=false){
  if(reset) bookLimit=24;
  const q=$("#bookSearch").value.trim().toLowerCase(), cat=$("#bookCategory").value;
  const matches=books.filter(b=>(cat==="all"||b.category===cat)&&(!q||`${b.title} ${b.category} ${b.detail}`.toLowerCase().includes(q)));
  $("#bookCount").textContent=`Showing ${Math.min(bookLimit,matches.length)} of ${matches.length} indexed books and volumes`;
  $("#bookGrid").innerHTML=matches.slice(0,bookLimit).map(b=>`<article class="book-card"><span class="tag">${b.category}</span><h3>${b.title}</h3><p>${b.detail}</p><a href="${b.url}" target="_blank" rel="noopener">Open publication record ↗</a></article>`).join("") || "<p>No books match those filters.</p>";
  $("#moreBooks").hidden=bookLimit>=matches.length;
}
function renderIssues(reset=false){
  if(reset) issueLimit=30;
  const q=$("#issueSearch").value.trim().toLowerCase(), pub=$("#publication").value, year=$("#issueYear").value;
  const matches=issueRecords.filter(x=>(pub==="all"||x.publication===pub)&&(year==="all"||String(x.year)===year)&&(!q||`${x.issue} ${x.title} ${x.date||""} ${x.year||""}`.toLowerCase().includes(q))).sort((a,b)=>b.issue-a.issue);
  $("#issueCount").textContent=`Showing ${Math.min(issueLimit,matches.length)} of ${matches.length} publication files`;
  $("#issueGrid").innerHTML=matches.slice(0,issueLimit).map(x=>`<article class="issue-card"><span class="issue-no">${x.publication} · ${x.issue}${x.version?` · VERSION ${x.version}`:""}</span><h3>${x.title}</h3>${x.date?`<time datetime="${x.dateISO||""}">${x.date}</time>`:""}<a href="${x.source}" target="_blank" rel="noopener">Read archived issue ↗</a></article>`).join("") || "<p>No issues match those filters.</p>";
  $("#moreIssues").hidden=issueLimit>=matches.length;
}

const langs = {"as":"Assamese","bn":"Bengali","bho":"Bhojpuri","gu":"Gujarati","hi":"Hindi","kn":"Kannada","ml":"Malayalam","mr":"Marathi","ne":"Nepali","or":"Odia","pa":"Punjabi","sa":"Sanskrit","sd":"Sindhi","si":"Sinhala","ta":"Tamil","te":"Telugu","ur":"Urdu","ar":"Arabic","zh-CN":"Chinese (Simplified)","zh-TW":"Chinese (Traditional)","nl":"Dutch","fr":"French","de":"German","el":"Greek","he":"Hebrew","id":"Indonesian","it":"Italian","ja":"Japanese","ko":"Korean","ms":"Malay","fa":"Persian","pl":"Polish","pt":"Portuguese","ro":"Romanian","ru":"Russian","es":"Spanish","sw":"Swahili","th":"Thai","tr":"Turkish","uk":"Ukrainian","vi":"Vietnamese"};
function togglePanel(id){ const el=$(id); const open=el.hidden; $$(".panel").forEach(p=>p.hidden=true); el.hidden=!open; }
function listen(text){
  if(!("speechSynthesis" in window)){ alert("Listening is not supported in this browser."); return; }
  speechSynthesis.cancel();
  const chosen=(text||window.getSelection()?.toString()||"").trim() || $(".hero-copy .dek").textContent;
  const u=new SpeechSynthesisUtterance(chosen); u.lang=/[\u0900-\u097F]/.test(chosen)?"hi-IN":"en-IN"; speechSynthesis.speak(u);
}
function openTranslate(){ const lang=$("#language").value; const url=`https://translate.google.com/translate?sl=en&tl=${encodeURIComponent(lang)}&u=${encodeURIComponent(location.href)}`; window.open(url,"_blank","noopener"); }
function globalSearch(q){
  q=q.trim().toLowerCase(); if(!q)return;
  const foundBooks=books.filter(b=>`${b.title} ${b.category} ${b.detail}`.toLowerCase().includes(q)).slice(0,20);
  const foundIssues=issueRecords.filter(x=>`${x.publication} ${x.issue} ${x.title} ${x.date||""} ${x.year||""}`.toLowerCase().includes(q)).slice(0,20);
  const foundStages=stages.filter(s=>`${s.title} ${s.kicker} ${s.text}`.toLowerCase().includes(q));
  const all=[...foundBooks.map(x=>({kind:"Book",title:x.title,desc:`${x.category} · ${x.detail}`,url:x.url})),...foundIssues.map(x=>({kind:"Issue",title:x.title,desc:`${x.publication} ${x.issue} · ${x.date||"undated"}`,url:x.source})),...foundStages.map(x=>({kind:"Stage",title:x.title,desc:x.text,url:x.href}))];
  $("#searchDialogTitle").textContent=`Results for “${q}”`;
  $("#searchResults").innerHTML=all.length?all.map(x=>`<article class="search-result"><span class="kind">${x.kind}</span><div><h3>${x.title}</h3><p>${x.desc}</p></div><a href="${x.url}" ${x.url.startsWith("http")?'target="_blank" rel="noopener"':""}>Open ↗</a></article>`).join(""):"<p>No matching books, issues or festival stages were found.</p>";
  $("#searchDialog").hidden=false; document.body.style.overflow="hidden"; $("#closeSearch").focus();
}

async function init(){
  renderCovers(); renderStages();
  Object.entries(langs).forEach(([code,name])=>$("#language").insertAdjacentHTML("beforeend",`<option value="${code}">${name}</option>`));
  try{
    const pothi=await fetch("data/pothi.json").then(r=>r.json());
    const seen=new Set(books.map(b=>`${b.title}|${b.category}`));
    pothi.forEach(x=>{const category=/गजेन्द्र ठाकुर|Gajendra Thakur/i.test(x.author)?"Gajendra Thakur archive":"Videha Pothi";const key=`${x.title}|${category}`;if(!seen.has(key)){books.push({title:x.title,category,detail:x.author||"Videha Pothi archive record",url:x.url||"https://www.videha.co.in/pothi.htm"});seen.add(key)}});
  }catch{}
  try{
    const githubBooks=await fetch("data/github-library.json").then(r=>r.json());
    const seenUrls=new Set(books.map(b=>b.url));
    githubBooks.forEach(x=>{if(!seenUrls.has(x.url)){books.push(x);seenUrls.add(x.url)}});
  }catch{}
  [...new Set(books.map(b=>b.category))].sort().forEach(c=>$("#bookCategory").insertAdjacentHTML("beforeend",`<option>${c}</option>`));
  renderBooks();
  try{
    const data=await fetch("data/archive.json").then(r=>r.json()); issueRecords=data.archive; $("#videhaCount").textContent=data.archiveMaxVideha; $("#lastUpdated").textContent=`Archive data updated ${new Date(data.generated).toLocaleDateString("en-IN",{dateStyle:"medium"})}`;
    [...new Set(issueRecords.map(x=>x.year).filter(Boolean))].sort((a,b)=>b-a).forEach(y=>$("#issueYear").insertAdjacentHTML("beforeend",`<option>${y}</option>`)); renderIssues();
  }catch(e){$("#issueCount").textContent="Archive index could not be loaded.";}
}

$("#bookSearch").addEventListener("input",()=>renderBooks(true)); $("#bookCategory").addEventListener("change",()=>renderBooks(true)); $("#clearBooks").addEventListener("click",()=>{$("#bookSearch").value="";$("#bookCategory").value="all";renderBooks(true)}); $("#moreBooks").addEventListener("click",()=>{bookLimit+=24;renderBooks()});
$("#issueSearch").addEventListener("input",()=>renderIssues(true)); $("#publication").addEventListener("change",()=>renderIssues(true)); $("#issueYear").addEventListener("change",()=>renderIssues(true)); $("#moreIssues").addEventListener("click",()=>{issueLimit+=30;renderIssues()});
$("#globalSearchForm").addEventListener("submit",e=>{e.preventDefault();globalSearch($("#globalSearch").value)}); $("#closeSearch").addEventListener("click",()=>{$("#searchDialog").hidden=true;document.body.style.overflow=""});
$("#listenBtn").addEventListener("click",()=>listen()); $("#readerListen").addEventListener("click",()=>listen($(".reader-copy p:nth-of-type(2)").textContent));
$("#translateBtn").addEventListener("click",()=>togglePanel("#translatePanel")); $("#readerTranslate").addEventListener("click",()=>togglePanel("#translatePanel")); $("#goTranslate").addEventListener("click",openTranslate);
$("#accessBtn").addEventListener("click",()=>togglePanel("#accessPanel")); $("#readerAccess").addEventListener("click",()=>togglePanel("#accessPanel"));
$("#accessPanel").addEventListener("click",e=>{const a=e.target.dataset.access;if(!a)return;if(a==="size")document.body.classList.toggle("large");if(a==="spacing")document.body.classList.toggle("spacious");if(a==="contrast")document.body.classList.toggle("contrast");if(a==="reset")document.body.className="";});
$(".menu-toggle").addEventListener("click",e=>{const open=$("#primary-nav").classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",open)}); $$("#primary-nav a").forEach(a=>a.addEventListener("click",()=>$("#primary-nav").classList.remove("open")));
window.addEventListener("scroll",()=>$("#toTop").classList.toggle("show",scrollY>700),{passive:true}); $("#toTop").addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
init();
