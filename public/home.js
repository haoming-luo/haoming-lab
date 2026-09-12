(() => {
  const scene=document.querySelector('.experience'),intro=document.querySelector('.intro'),chapter=document.querySelector('.chapter'),art=document.querySelector('.art'),hint=document.querySelector('.scroll-hint'),button=document.querySelector('#motion');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
  const secondArt=document.querySelector('.art-secondary'),secondImage=secondArt.querySelector('img');
  let secondReady=false;
  secondImage.addEventListener('load',()=>{secondReady=true;schedule()});
  let paused=reduced.matches,queued=false;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function render(){
    queued=false;
    const p=clamp(-scene.getBoundingClientRect().top/Math.max(1,scene.offsetHeight-innerHeight));
    const fade=clamp((p-.2)/.35),reveal=clamp((p-.48)/.35),small=mobile.matches;
    if((p>.04||small)&&!secondImage.getAttribute('src'))secondImage.src=secondImage.dataset.src;
    intro.style.opacity=small?1:1-fade;intro.style.transform=paused?'none':`translateY(${-fade*50}px)`;
    chapter.style.opacity=small?1:reveal;chapter.style.transform=paused?'none':`translateY(${(1-reveal)*45}px)`;
    const active=small||reveal>.4;chapter.inert=!active;chapter.setAttribute('aria-hidden',String(!active));chapter.toggleAttribute('data-active',active);
    intro.inert=!small&&fade>.95;
    art.style.transform=paused?'none':`translate3d(${-p*3}%,${p*7}%,0) scale(${1+p*.045}) rotate(${-p*1.5}deg)`;
    art.style.opacity=small?1:1-clamp((p-.28)/.23);
    secondArt.style.opacity=small?1:(secondReady?reveal:0);
    secondArt.style.transform=paused||small?'none':`translate3d(${(1-reveal)*-4}%,0,0)`;
    document.body.classList.toggle('at-end',!small&&p>.98);
    hint.style.opacity=1-p;document.querySelector('.scene>footer').style.opacity=small?1:clamp((p-.72)/.25);document.body.classList.toggle('motion-paused',paused);
    button.textContent=paused?'开启动效':'暂停动效';button.setAttribute('aria-pressed',String(paused));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',()=>{paused=reduced.matches;schedule()});button.addEventListener('click',()=>{paused=!paused;schedule()});render();
  // A boundary-only fallback for embedded browsers that retain native rubber-banding.
  function outward(dy){const root=document.scrollingElement;return dy<0?root.scrollTop<=1:root.scrollTop+root.clientHeight>=root.scrollHeight-1;}
  addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey&&Math.abs(e.deltaY)>Math.abs(e.deltaX)&&outward(e.deltaY)&&e.cancelable)e.preventDefault();},{passive:false});
  let touch=null;
  addEventListener('touchstart',e=>{touch=e.touches.length===1?[e.touches[0].clientX,e.touches[0].clientY]:null;},{passive:true});
  addEventListener('touchmove',e=>{if(e.touches.length!==1){touch=null;return;}const now=[e.touches[0].clientX,e.touches[0].clientY],old=touch;touch=now;if(old){const dy=old[1]-now[1];if(Math.abs(dy)>Math.abs(old[0]-now[0])&&outward(dy)&&e.cancelable)e.preventDefault();}},{passive:false});
  addEventListener('touchend',()=>{touch=null;},{passive:true});
})();
