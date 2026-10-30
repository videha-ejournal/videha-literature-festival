const $=s=>document.querySelector(s);
const mai=document.documentElement.lang==='mai';
function revealHash(){
  const id=decodeURIComponent(location.hash.slice(1));const target=document.getElementById(id);if(!target)return;
  let parent=target.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
  requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
}
window.addEventListener('hashchange',revealHash);revealHash();
document.addEventListener('click',event=>{
  const player=event.target.closest('[data-load-player]');
  if(player){const frame=document.getElementById(player.dataset.loadPlayer);if(!frame.src)frame.src=frame.dataset.src;player.hidden=true;}
  const anchor=event.target.closest('a[href*="#"]');
  if(anchor){const url=new URL(anchor.href);if(url.pathname===location.pathname){const target=document.getElementById(decodeURIComponent(url.hash.slice(1)));let p=target;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement;}}}
});
// Panels are non-modal: move focus inside, allow normal Tab navigation, close with Escape.
for(const [buttonId,panelId] of [['translateBtn','translatePanel'],['accessBtn','accessPanel']]){
  const button=$('#'+buttonId),panel=$('#'+panelId);if(!button||!panel)continue;
  button.setAttribute('aria-controls',panelId);button.setAttribute('aria-expanded','false');
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){panel.hidden=true;button.setAttribute('aria-expanded','false');button.focus();event.stopPropagation();}});
  button.addEventListener('click',()=>{
    if(!$('#globalSearchForm')) {const open=panel.hidden;document.querySelectorAll('.panel').forEach(p=>p.hidden=true);panel.hidden=!open;}
    document.querySelectorAll('.panel').forEach(p=>{const opener=document.querySelector(`[aria-controls="${p.id}"]`);opener?.setAttribute('aria-expanded',String(!p.hidden));});
    if(!panel.hidden)panel.querySelector('button,select,a')?.focus();
  });
}
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  for(const panel of document.querySelectorAll('.panel:not([hidden])')){panel.hidden=true;const opener=document.querySelector(`[aria-controls="${panel.id}"]`);opener?.setAttribute('aria-expanded','false');opener?.focus();}
  if($('#primary-nav')?.classList.contains('open')){$('#primary-nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').focus();}
});
document.querySelectorAll('#primary-nav a').forEach(a=>a.addEventListener('click',()=>$('.menu-toggle').setAttribute('aria-expanded','false')));
if(!$('#globalSearchForm')){
  $('.menu-toggle')?.addEventListener('click',()=>{const open=$('#primary-nav').classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',String(open));});
  $('#accessPanel')?.addEventListener('click',e=>{const key=e.target.dataset.access;if(key==='reset')document.body.className='';else if(key)document.body.classList.toggle({size:'large',spacing:'spacious',contrast:'contrast'}[key]);});
  $('#goTranslate')?.addEventListener('click',()=>window.open(`https://translate.google.com/translate?sl=${mai?'mai':'en'}&tl=${$('#language').value}&u=${encodeURIComponent(location.href)}`,'_blank','noopener'));
  $('#listenBtn')?.addEventListener('click',()=>{if(!window.speechSynthesis)return;const speech=new SpeechSynthesisUtterance(window.getSelection()?.toString()||$('main').textContent.slice(0,3000));speech.lang=mai?'mai-IN':'en-IN';speechSynthesis.cancel();speechSynthesis.speak(speech);});
  $('#toTop')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'instant'}));
}
// Announce new-window behavior for cards added after data loads.
function labelExternal(root){
  for(const a of root.querySelectorAll?.('a[target="_blank"]')||[])if(!a.hasAttribute('aria-label'))a.setAttribute('aria-label',`${a.textContent.trim()} (${mai?'नव टैबमे खुलैत अछि':'opens in a new tab'})`);
}
labelExternal(document);
new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)labelExternal(n);}))).observe(document.body,{childList:true,subtree:true});
