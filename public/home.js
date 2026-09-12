(() => {
  const scene=document.querySelector('.experience'),intro=document.querySelector('.intro'),chapter=document.querySelector('.chapter'),art=document.querySelector('.art'),hint=document.querySelector('.scroll-hint'),button=document.querySelector('#motion');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
  let paused=reduced.matches,queued=false;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function render(){
    queued=false;
    const p=clamp(-scene.getBoundingClientRect().top/Math.max(1,scene.offsetHeight-innerHeight));
    const fade=clamp((p-.2)/.35),reveal=clamp((p-.48)/.35),small=mobile.matches;
    intro.style.opacity=small?1:1-fade;intro.style.transform=paused?'none':`translateY(${-fade*50}px)`;
    chapter.style.opacity=small?1:reveal;chapter.style.transform=paused?'none':`translateY(${(1-reveal)*45}px)`;
    const active=small||reveal>.4;chapter.inert=!active;chapter.setAttribute('aria-hidden',String(!active));chapter.toggleAttribute('data-active',active);
    intro.inert=!small&&fade>.95;
    art.style.transform=paused?'none':`translate3d(${-p*3}%,${p*7}%,0) scale(${1+p*.045}) rotate(${-p*1.5}deg)`;
    hint.style.opacity=1-p;document.body.classList.toggle('motion-paused',paused);
    button.textContent=paused?'开启动效':'暂停动效';button.setAttribute('aria-pressed',String(paused));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',()=>{paused=reduced.matches;schedule()});button.addEventListener('click',()=>{paused=!paused;schedule()});render();
})();
