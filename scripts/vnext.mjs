import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import vm from 'node:vm';

const base = 'https://videha-ejournal.github.io/videha-literature-festival/';
const routes = {books:'Books',issues:'Issues',stages:'Stages',theatre:'Theatre',criticism:'Criticism','world-exchange':'World exchange',media:'Media',about:'About',accessibility:'Accessibility'};
const selectors = {books:'#books',issues:'#issues',stages:'#stages',theatre:'#rangmanchArchive',criticism:'#criticismArchive','world-exchange':'#world-exchange',media:'#media',about:'#about',accessibility:'#accessibility'};
const escape = (s='') => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scriptJSON = value => JSON.stringify(value).replace(/</g,'\\u003c');
const translations = {
  'Search scope':'खोजक क्षेत्र','Festival selection':'उत्सवक चयन','GitHub editions':'गिटहब संस्करण','All shelves':'सभ खण्ड','Both publications':'दुनू पत्रिका','All years':'सभ वर्ष','Filter the visible periodical desk':'एहि सूचीमे अंक छाँटू','Videha':'विदेह','Sadeha':'सदेह','Videha Pothi':'विदेह पोथी',
  'Four living Videha programmes':'विदेहक चारि निरन्तर कार्यक्रम','Kids · Shishu Utsav':'बाल जगत · शिशु उत्सव','Strī-Koṇa':'स्त्री-कोणा','Videha E-learning':'विदेह ई-लर्निङ्ग','Dṛśya–Śravya Nāṭya Utsav':'दृश्य-श्रव्य नाट्य उत्सव',
  'Gajendra Thakur’s cumulative shelf':'गजेन्द्र ठाकुरक समग्र रचना','Browse the verified shelf three ways':'सत्यापित पोथी तीन तरहेँ देखू','The complete catalogue is also available without JavaScript.':'सम्पूर्ण पोथी-सूची बिना जावास्क्रिप्टक उपलब्ध अछि।','Issue browsing without JavaScript':'बिना जावास्क्रिप्टक अंक देखू',
  'Six source-led Festival Stages':'मूल स्रोतसँ जुड़ल छओ उत्सव मंच','Kavita Sabha':'कविता सभा','Rangmanch':'रंगमंच','Shishu Utsav':'शिशु उत्सव','Anuvad Manch':'अनुवाद मंच','Samiksha Kaksh':'समीक्षा कक्ष','Archive Assembly':'अभिलेख सभा','Find children’s books ↓':'बाल पोथी ताकू ↓','Find translations ↓':'अनुवाद ताकू ↓','Find criticism ↓':'समीक्षा ताकू ↓',
  'Watch, read and follow Maithili theatre':'मैथिली रंगमंच देखू, पढ़ू आ जुड़ू','Load player':'प्लेयर खोलू','Playlists':'प्लेलिस्ट','Performances':'प्रस्तुति','Theatre network':'रंगमंच संस्था','Texts & criticism':'पाठ आ समीक्षा','Results':'परिणाम',
  'Seven windows beyond Videha':'विदेहसँ बाहर सात साहित्यिक बाट','Stories, authors and illustration':'कथा, लेखक आ चित्रांकन','Voice, authorship and equality':'स्वर, लेखन आ समानता','Poets in their own voices':'कविक अपन स्वर','Performance across languages':'विभिन्न भाषाक प्रस्तुति','Review, argument and close reading':'समीक्षा, विमर्श आ सूक्ष्म पाठ','Languages meeting languages':'भाषासँ भाषाक संवाद','Public conversations across continents':'महाद्वीपसभक साहित्यिक संवाद','Four verified playlist collections':'चारि सत्यापित प्लेलिस्ट संग्रह','Videha eJournal':'विदेह ई-पत्रिका','Accessible Videha':'सुगम विदेह','Gajendra Thakur':'गजेन्द्र ठाकुर','Read in the way that works for you.':'अपन सुविधानुसार पढ़ू।','Videha is the ground beneath the festival.':'विदेह एहि उत्सवक आधार अछि।',
  'Books':'पोथी','Issues':'अंक','Stages':'मंच','Theatre':'रंगमंच','Criticism':'समीक्षा','World exchange':'विश्व साहित्य संवाद','Media':'दृश्य-श्रव्य','About':'परिचय','Accessibility':'सुगमता',
  'Menu':'सूची','Wings':'प्रभाग','Videha media':'विदेह दृश्य-श्रव्य','Translate page':'पृष्ठक अनुवाद','Reading controls':'पढ़बाक सुविधा','Larger text':'पैघ अक्षर','More spacing':'बेसी अन्तर','High contrast':'गाढ़ रंग','Reset':'पहिने जकाँ','Open translation':'अनुवाद खोलू',
  'A festival where an archive becomes a meeting place.':'एहन साहित्य उत्सव जतय अभिलेखागार भेटघाँटक ठाम बनैत अछि।',
  'Enter through books, periodicals, performance and ideas. Explore Gajendra Thakur’s cumulative works alongside the complete Videha and Sadeha issue archive—without losing the sources behind them.':'पोथी, पत्रिका, अभिनय आ विचारक बाटे प्रवेश करू। गजेन्द्र ठाकुरक समग्र रचनाक संग विदेह आ सदेहक संरक्षित अंक पढ़ू आ मूल स्रोत धरि पहुँचू।',
  'Enter the book pavilion':'पोथी मण्डपमे आउ','Browse every issue':'सभ अंक देखू','Search books, authors, issues, stages, media and world programmes':'पोथी, लेखक, अंक, मंच, दृश्य-श्रव्य आ विश्व कार्यक्रम ताकू',
  'Search everything':'सभमे ताकू','All':'सभ','Clear all':'सभ हटाउ','Sort results':'परिणामक क्रम','Relevance':'प्रासंगिकता','Title A–Z':'शीर्षक अनुसार','Newest issues first':'नव अंक पहिने','Oldest issues first':'पुरान अंक पहिने',
  'Show more books':'आओर पोथी देखू','Show more issues':'आओर अंक देखू','Clear':'हटाउ','Shelf listing':'पोथीक सूची','Bookwise · A–Z':'पोथीक नाम अनुसार','Authorwise':'लेखक अनुसार','All verified records':'सभ सत्यापित अभिलेख',
  'Current Videha Issue':'विदेहक नूतन अंक','Read current issue →':'नूतन अंक पढ़ू →','Follow Videha':'विदेहसँ जुड़ू','Current Issue':'नूतन अंक','Email Subscription':'ई-पत्र सदस्यता','Archive':'अभिलेखागार',
  'Choose a way in':'अपन बाट चुनू','Book pavilion':'पोथी मण्डप','Periodical archive':'पत्रिका अभिलेखागार','Festival stages':'उत्सवक मंच','Reading room':'पठन कक्ष','Every issue, one searchable desk':'सभ अंक, एके ठाम खोज',
  'Close search':'खोज बन्द करू','Skip to festival':'मुख्य सामग्रीपर जाउ','Back to top ↑':'ऊपर जाउ ↑','archived Videha issues':'संरक्षित विदेह अंक','Browse issues ↓':'अंक देखू ↓','Browse Sadeha ↓':'सदेह देखू ↓',
  'Permanent festival pages':'उत्सवक स्थायी पृष्ठ','Open full page →':'पूरा पृष्ठ खोलू →','Explore this section':'ई खण्ड देखू','English':'English',
  'Search titles and series':'पोथी आ शृंखला ताकू','Filter this issue desk':'अंक छाँटू','Try Panji, Vidyapati, issue 307, Kanyadaan…':'पंजी, विद्यापति, अंक ३०७, कन्यादान…',
  'Translate this English page with Google Translate':'अन्य भाषामे पढ़बाक लेल गूगल अनुवाद चुनू','Translate this site':'ई साइटक अनुवाद','Accessibility settings':'पढ़बाक सुविधाक विन्यास','Copy citation':'उद्धरण कॉपी','Citation copied':'उद्धरण कॉपी भेल'
};
export function translate(document) {
  const walk = node => {
    if (['SCRIPT','STYLE'].includes(node.tagName)) return;
    if (node.nodeType === 3) { const text=node.textContent.trim(); let translated=translations[text];
      if(!translated && text.includes(' · Explore this section'))translated=(translations[text.split(' · ')[0]]||text.split(' · ')[0])+' · ई खण्ड देखू';
      if(!translated && /^Part \d+$/.test(text))translated=text.replace('Part','भाग');
      if(!translated && /^(All|Playlists|Performances|Theatre network|Texts & criticism) · \d+$/.test(text))translated=translations[text.split(' · ')[0]]+' · '+text.split(' · ')[1];
      if(translated) node.textContent=node.textContent.replace(text,translated); }
    for (const attr of ['aria-label','placeholder','title']) if(node.hasAttribute?.(attr) && translations[node.getAttribute(attr)]) node.setAttribute(attr,translations[node.getAttribute(attr)]);
    for(const child of [...node.childNodes]) walk(child);
  };
  walk(document.body);
  // Original editorial descriptions and publication titles are preserved in their source language.
  for(const el of document.querySelectorAll('p,h2,h3,span,small,label,option,summary,a,button')) {
    if(!el.children.length && /[A-Za-z]{3}/.test(el.textContent) && !/[\u0900-\u097f]/.test(el.textContent)) el.lang='en';
  }
  document.documentElement.lang='mai';
  document.title='विदेह साहित्य उत्सव';
}
export async function buildNext({root,out,manifest,stats,githubArchive,byTitle}) {
  let html=await readFile(path.join(root,'public/index.html'),'utf8');
  html=html.replace(/\{\{(\w+)\}\}/g,(_,key)=>{if(!(key in stats))throw Error(`Unknown statistic ${key}`);return stats[key];});
  const {document}=parseHTML(html);
  const app=await readFile(path.join(out,'app.js'),'utf8');
  const langs=vm.runInNewContext(app.slice(app.indexOf('const langs'),app.indexOf('function togglePanel'))+';langs',{}, {timeout:1000});
  document.querySelector('#language').innerHTML=Object.entries(langs).map(([code,name])=>`<option value="${code}">${name}</option>`).join('');
  const curated=vm.runInNewContext(app.slice(app.indexOf('const parallelTomes'),app.indexOf('const covers'))+';books',{}, {timeout:1000});
  const gajendraBooks=vm.runInNewContext(app.slice(app.indexOf('const gajendraBooks'),app.indexOf('const gajendraPdf'))+';gajendraBooks',{}, {timeout:1000});
  const media=vm.runInNewContext(app.slice(app.indexOf('const rangmanchMedia'),app.indexOf('const stages'))+';rangmanchMedia',{}, {timeout:1000});
  document.querySelector('#rangmanchGrid').innerHTML=media.map(r=>`<a class="rangmanch-item" href="${escape(r.url)}"><span>${escape(r.group)}</span><strong>${escape(r.title)}</strong><em>Open source ↗</em></a>`).join('');
  const make=(markup)=>{const template=document.createElement('template');template.innerHTML=markup;return template.content.firstElementChild;};
  const date=new Date(manifest.currentIssueDate+'T12:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric',timeZone:'UTC'});
  const card=`<aside class="current-issue" aria-label="Current Videha Issue"><p class="eyebrow">Current Videha Issue</p><strong lang="mai">अंक ${String(manifest.currentIssue).replace(/\d/g,n=>'०१२३४५६७८९'[n])}</strong> · <time datetime="${manifest.currentIssueDate}">${date}</time><a href="${manifest.currentIssueUrl}">Read current issue →</a></aside>`;
  document.querySelector('.hero-actions').after(make(card));
  if(!document.querySelector('#languageSwitch')) document.querySelector('.utility').prepend(make('<a id="languageSwitch" href="mai/" lang="mai" class="language-link">मैथिली · Maithili</a>'));
  document.querySelector('#globalSearchForm').append(make(`<fieldset class="search-scopes"><legend>Search scope</legend>${['All','Books','Issues','Stages','Media','World exchange'].map((label,i)=>`<button type="button" data-scope="${['all','books','issues','stages','media','world'][i]}" aria-pressed="${i===0}">${label} <span data-scope-count="${['all','books','issues','stages','media','world'][i]}"></span></button>`).join('')}<label for="searchSort">Sort results</label><select id="searchSort"><option value="relevance">Relevance</option><option value="title">Title A–Z</option><option value="newest">Newest issues first</option><option value="oldest">Oldest issues first</option></select><button type="button" id="clearAll">Clear all</button></fieldset>`));
  document.querySelector('.four-doors').after(make(`<nav class="page-nav" aria-label="Permanent festival pages">${Object.entries(routes).map(([slug,label])=>`<a href="${slug}/">${label}</a>`).join('')}</nav>`));
  const follow=`<nav class="follow-videha" aria-label="Follow Videha"><strong>Follow Videha</strong><a href="${manifest.currentIssueUrl}">Current Issue</a><a href="https://groups.google.com/g/videha">Email Subscription</a><a href="https://www.videha.co.in/videha-rss.xml">RSS</a><a href="issues/">Archive</a></nav>`;
  document.querySelector('footer').before(make(follow));
  document.querySelector('footer').append(make('<a href="accessibility/">Accessibility</a>'));
  document.querySelector('#main').append(make(`<section id="accessibility" class="about-section"><h2>Accessibility</h2><p>This interface aims to support WCAG 2.2 AA. Use the skip link, keyboard navigation, visible focus, reading controls and the first-party Maithili interface. Search supports Escape to close and returns focus to its opener. All material is also available on permanent pages without JavaScript.</p><p>Known limitations: historical PDFs may be scanned or lack tags; third-party recordings may lack captions, transcripts or audio description. Browser narration depends on installed voices and is not a substitute for a screen reader. The linked sources control their own accessibility.</p><p>For an accessibility problem, email <a href="mailto:editorial.staff.videha@zohomail.in">editorial.staff.videha@zohomail.in</a> with the page address, the difficulty and your preferred format. This statement records an improvement effort, not a certification of full conformance.</p></section>`));
  for(const frame of document.querySelectorAll('iframe[data-src]')) frame.before(make(`<button type="button" data-load-player="${frame.id}">Load player</button>`));
  for(const image of document.querySelectorAll('img')) { image.setAttribute('decoding','async'); if(!image.getAttribute('fetchpriority'))image.setAttribute('loading','lazy'); }
  document.head.append(make(`<script id="archiveMeta" type="application/json">${scriptJSON({...stats,stats,currentIssue:manifest.currentIssue,currentIssueDate:manifest.currentIssueDate,currentIssueUrl:manifest.currentIssueUrl})}</script>`));
  document.head.append(make(`<script id="interfaceTranslations" type="application/json">${scriptJSON(translations)}</script>`));
  for(const [id,label] of [['bookSearch','Search titles and series'],['bookCategory','All shelves'],['publication','Both publications'],['issueYear','All years']])document.getElementById(id)?.setAttribute('aria-label',label);
  document.head.append(make('<link rel="stylesheet" href="vnext.css">'));
  document.head.append(make('<link rel="alternate" type="application/rss+xml" title="Videha new issues" href="https://www.videha.co.in/videha-rss.xml">'));
  const graph=JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  graph.push({'@type':'Organization','@id':base+'#organization',name:'Videha Maithili eJournal',url:'https://www.videha.co.in/'});
  graph.push({'@type':'Person','@id':base+'#editor',name:'Gajendra Thakur'});
  for(const item of graph.filter(x=>['WebSite','Periodical','CollectionPage'].includes(x['@type']))) {item.publisher={'@id':base+'#organization'};item.dateModified=manifest.generated.slice(0,10);}
  graph.find(x=>x['@type']==='Periodical').editor={'@id':base+'#editor'};
  graph.push({'@type':'PublicationIssue',issueNumber:manifest.currentIssue,datePublished:manifest.currentIssueDate,url:manifest.currentIssueUrl,isPartOf:{'@type':'Periodical',name:'Videha Maithili eJournal',issn:'2229-547X'}});
  const original=document.toString();
  const gajendraHtml=`<div class="static-records"><h2>गजेन्द्र ठाकुर समग्र · Gajendra Thakur Samagra</h2><p>सम्पादक: आशीष अनचिन्हार / गजेन्द्र ठाकुर समग्रक सम्पादकीय</p><ol>${gajendraBooks.map(b=>`<li><strong>${escape(b.section)} · ${escape(b.title)}</strong> · ${escape(b.detail)} · <a href="https://raw.githubusercontent.com/videha-ejournal/videha-ejournal/main/${encodeURIComponent(b.file)}">Read PDF</a></li>`).join('')}</ol></div>`;
  const staticBooks=`${gajendraHtml}<div class="static-records"><h2>Festival selection</h2><ol>${curated.map(b=>`<li><strong>${escape(b.title)}</strong> · ${escape(b.detail)} ${(b.links||[{label:'Open publication',url:b.url}]).map(l=>`<a href="${escape(l.url)}">${escape(l.label)}</a>`).join(' · ')}</li>`).join('')}</ol><h2>Complete publication catalogue</h2><p><a href="catalogue.html">Bookwise and authorwise catalogue</a></p><ol>${byTitle.map(b=>`<li><a href="${escape(b.url)}">${escape(b.title)}</a>${b.author?' · '+escape(b.author):''}</li>`).join('')}</ol></div>`;
  const staticIssues=`<div class="static-records"><h2>All preserved issues</h2><p>${stats.sadehaIssues} Sadeha issues · ${stats.sadehaFiles} preserved files. Sadeha 5 has two preserved versions.</p><ol>${githubArchive.map(r=>`<li><a href="${escape(r.source)}">${escape(r.title)}${r.version?` · Version ${r.version}`:''}</a> ${escape(r.date)}</li>`).join('')}</ol></div>`;
  for(const locale of ['en','mai']) for(const slug of ['',...Object.keys(routes)]) {
    const {document:page}=parseHTML(original);
    const prefix=locale==='mai'?'mai/':'';
    const relative=prefix+(slug?slug+'/':'');
    const pageUrl=base+relative;
    if(locale==='mai') {
      page.querySelector('link[rel="canonical"]').href=pageUrl;
      page.querySelector('meta[property="og:url"]').content=pageUrl;
      page.querySelector('meta[property="og:title"]').content='विदेह साहित्य उत्सव';
      page.querySelector('meta[property="og:description"]').content='मैथिली साहित्य, पोथी, पत्रिका, रंगमंच आ विश्व साहित्यक उत्सव।';
      page.querySelector('meta[property="og:image"]').content=base+'assets/VIDEHA%20LITERATURE%20FESTIVAL.png';
      page.querySelector('meta[name="twitter:title"]').content='विदेह साहित्य उत्सव';
      page.querySelector('meta[name="twitter:description"]').content='मैथिली साहित्य, पोथी, पत्रिका, रंगमंच आ विश्व साहित्यक उत्सव।';
      for(const a of page.querySelectorAll('a[href="https://videha-ejournal.github.io/gajendra-preeti/en/"]')) a.href='https://videha-ejournal.github.io/gajendra-preeti/';
    }
    if(slug) {
      const section=page.querySelector(selectors[slug]).outerHTML;
      page.querySelector('main').innerHTML=`<nav class="page-nav"><a href="${base+prefix}">${locale==='mai'?'मुख्य पृष्ठ':'Festival home'}</a>${Object.entries(routes).map(([s,l])=>`<a href="${base+prefix+s}/">${l}</a>`).join('')}</nav><h1 class="page-title">${routes[slug]}</h1>${slug==='issues'?card:''}${section}${slug==='books'?staticBooks:slug==='issues'?staticIssues:''}`;
      page.querySelector('script[src="app.js"]').remove();
      // Permanent pages have source-linked material even without the application runtime.
      for(const controls of page.querySelectorAll('.filterbar,.catalogue-ledger,.view-switcher,.catalogue-note,.filter-explainer,.rangmanch-controls,#moreBooks,#moreIssues')) controls.remove();
      for(const el of page.querySelectorAll('button[data-book-query]')) el.outerHTML=`<a href="${base+prefix}?q=${encodeURIComponent(el.dataset.bookQuery)}">${el.textContent}</a>`;
      for(const button of page.querySelectorAll('[data-archive-part]')) button.outerHTML=`<a href="https://archive.org/details/videha-discussion-criticism-part-${button.dataset.archivePart}">${button.textContent}</a>`;
      page.title=`${routes[slug]} · Videha Literature Festival`;
    } else {
      for(const [id,title] of Object.entries(routes)) {
        const section=page.querySelector(selectors[id]);
        if(!section || id==='theatre' || id==='criticism')continue;
        const details=page.createElement('details');details.className='section-disclosure';
        details.innerHTML=`<summary>${title} · Explore this section</summary><p class="permanent-link"><a href="${base+prefix+id}/">Open full page →</a></p>`;
        section.before(details);details.append(section);
      }
    }
    // Fully qualify local resources and route links for GitHub project Pages and nested locales.
    for(const el of page.querySelectorAll('[href],[src],[data-src]')) for(const attr of ['href','src','data-src']) {
      const value=el.getAttribute(attr);if(!value || /^(?:https?:|mailto:|#|data:)/.test(value))continue;
      el.setAttribute(attr,base+value);
    }
    for(const a of page.querySelectorAll('a[href^="#"]')) if(slug && !page.getElementById(a.getAttribute('href').slice(1)))a.href=base+prefix+a.getAttribute('href');
    const language=page.querySelector('.language-link');language.href=base+(locale==='en'?'mai/':'')+(slug?slug+'/':'');language.textContent=locale==='en'?'मैथिली':'English';language.lang=locale==='en'?'mai':'en';
    page.querySelector('link[rel="canonical"]').href=pageUrl;
    page.querySelector('meta[property="og:url"]').content=pageUrl;
    for(const [lang,url] of [['en',base+(slug?slug+'/':'')],['mai',base+'mai/'+(slug?slug+'/':'')],['x-default',base+(slug?slug+'/':'')]]){const link=page.createElement('link');link.rel='alternate';link.hreflang=lang;link.href=url;page.head.append(link);}
    const pageGraph=[...graph,{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Videha Literature Festival',item:base+prefix},...(slug?[{'@type':'ListItem',position:2,name:routes[slug],item:pageUrl}]:[])]}];
    if(slug==='books') pageGraph.push({'@type':'ItemList',numberOfItems:byTitle.length,itemListElement:byTitle.map((b,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Book',name:b.title,url:b.url,...(b.author?{author:{'@type':'Person',name:b.author}}:{})}}))});
    if(slug==='issues')pageGraph.push({'@type':'ItemList',numberOfItems:githubArchive.length,itemListElement:githubArchive.map((r,i)=>({'@type':'ListItem',position:i+1,url:r.source,name:r.title}))});
    if(['theatre','stages','media'].includes(slug))pageGraph.push(...media.filter(r=>r.kind==='video').map(r=>({'@type':'VideoObject',name:r.title,url:r.url,embedUrl:`https://www.youtube-nocookie.com/embed/${r.id}`,thumbnailUrl:`https://i.ytimg.com/vi/${r.id}/hqdefault.jpg`})));
    if(slug==='books')pageGraph.push(...curated.flatMap(b=>(b.links||[]).filter(l=>/audio/i.test(l.label)).map(l=>({'@type':'AudioObject',name:b.title,url:l.url,encodingFormat:'audio',isPartOf:{'@type':'Book',name:b.title}}))));
    page.querySelector('script[type="application/ld+json"]').textContent=scriptJSON({'@context':'https://schema.org','@graph':pageGraph});
    const enhancements=page.createElement('script');enhancements.src=base+'enhancements.js';enhancements.type='module';page.body.append(enhancements);
    if(locale==='mai')translate(page);
    const relativeRoot='../'.repeat(relative.split('/').filter(Boolean).length)||'./';
    for(const el of page.querySelectorAll('a[href],script[src],img[src],link[rel="stylesheet"]'))for(const attr of ['href','src']) {
      const value=el.getAttribute(attr);if(value?.startsWith(base))el.setAttribute(attr,relativeRoot+value.slice(base.length));
    }
    for(const a of page.querySelectorAll('a[target="_blank"]'))a.setAttribute('aria-label',`${a.textContent.trim()} (${locale==='mai'?'नव टैबमे खुलैत अछि':'opens in a new tab'})`);
    await mkdir(path.join(out,relative),{recursive:true});await writeFile(path.join(out,relative,'index.html'),page.toString());
  }
  const urls=['','mai/',...Object.keys(routes).flatMap(s=>[s+'/',`mai/${s}/`]),'catalogue.html'];
  await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${base+u}</loc><lastmod>${manifest.generated.slice(0,10)}</lastmod></url>`).join('')}</urlset>`);
  const readmePath=path.join(root,'README.md');let readme=await readFile(readmePath,'utf8');
  readme=readme.replace(/- Direct GitHub repository links[^\n]*/,`- Direct GitHub repository links for all ${stats.totalFiles} preserved Videha/Sadeha PDF files: ${stats.videhaIssues} Videha issues and ${stats.sadehaFiles} Sadeha files covering ${stats.sadehaIssues} issues, including issue 5’s second version.`);
  const block=`<!-- archive-stats:start -->\nCurrent Videha: **${manifest.currentIssue} · ${date}**. **${stats.videhaIssues} archived Videha issues**; **${stats.sadehaIssues} Sadeha issues · ${stats.sadehaFiles} preserved files**; **${stats.totalFiles} preserved files total**.\n<!-- archive-stats:end -->`;
  readme=/<!-- archive-stats:start -->/.test(readme)?readme.replace(/<!-- archive-stats:start -->[\s\S]*?<!-- archive-stats:end -->/,block):readme+'\n## Generated archive statistics\n\n'+block+'\n';
  await writeFile(readmePath,readme);
}
