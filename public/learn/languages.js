(()=>{
 const packed=document.getElementById('offline-translations');
 const bodies=packed?JSON.parse(packed.textContent):null;
 document.addEventListener('click',event=>{
  const link=event.target.closest('[data-language]');
  if(!link)return;
  // A previously selected exercise must not hijack a language change.
  if(!bodies)return;
  event.preventDefault();
  const lang=link.dataset.language;
  document.documentElement.lang=lang==='zh'?'zh-CN':lang;
  document.body.innerHTML=bodies[lang];
  document.title=document.querySelector('h1').textContent+' · AgentFEM';
  initLearningCopy();
  if(location.hash)history.replaceState(null,'',location.pathname+location.search);
  window.scrollTo({top:0,behavior:'instant'});
 });
})();
