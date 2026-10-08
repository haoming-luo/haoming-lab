(()=>{
 const packed=document.getElementById('offline-translations');
 const bodies=packed?JSON.parse(packed.textContent):null;
 document.addEventListener('click',event=>{
  const link=event.target.closest('[data-language]');
  if(!link)return;
  const hash=location.hash;
  if(!bodies){link.hash=hash;return;}
  event.preventDefault();
  const lang=link.dataset.language;
  document.documentElement.lang=lang==='zh'?'zh-CN':lang;
  document.body.innerHTML=bodies[lang];
  document.title=document.querySelector('h1').textContent+' · AgentFEM';
  initLearningCopy();
  if(hash)document.getElementById(hash.slice(1))?.scrollIntoView();
  else window.scrollTo(0,0);
 });
})();
