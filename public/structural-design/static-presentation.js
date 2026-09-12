/* Keep the original presentation; only disclose the recorded-result mode. */
(() => {
  const methodLink=document.querySelector('header a');const nav=document.createElement('nav');nav.className='lab-nav';
  const home=document.createElement('a');home.href='../';home.textContent='Lab 首页';nav.append(home,methodLink);document.querySelector('header').append(nav);
  $('search-message').setAttribute('role','status');$('search-message').setAttribute('aria-live','polite');
  const parametersTitle=document.querySelector('#parameters').closest('details').querySelector('summary');
  const fullVersion=document.createElement('small');fullVersion.textContent='完整版需 Python + GINO 环境';fullVersion.style.cssText='display:block;margin:5px 0 8px 14px;font-size:11px;line-height:1.5;color:var(--muted);font-weight:400';parametersTitle.append(fullVersion);
  const originalPrediction=showPrediction;
  showPrediction=async result=>{
    await originalPrediction(result);
    $('after-label').textContent+='（仅供演示）';
    // Original click handlers finish their status text after this promise.
    setTimeout(()=>{
      if(result.precomputed){
        $('search-message').textContent=result.matched?'已复用本结构的 GINO 预测。':'已匹配相近方案，参数已同步。';
      }
    },0);
  };
  window.LAB_STATIC_READY.then(()=>{
    const cad=$('cad');
    cad.addEventListener('click',async event=>{
      event.preventDefault();if(cad.dataset.loading)return;
      cad.dataset.loading='true';const label=cad.textContent;cad.textContent='正在准备 CAD…';
      try{const url=await window.LAB_GET_CAD(cad.href);const link=document.createElement('a');link.href=url;link.download='支架结构.step';link.click();}
      catch(error){$('search-message').textContent=error.message;}
      finally{delete cad.dataset.loading;cad.textContent=label;}
    });
    const sync=()=>{
      const path=cad.getAttribute('href');const url=window.LAB_STATIC_LINKS[path];
      if(url){cad.href=url;cad.download='支架结构.step';}
    };
    new MutationObserver(sync).observe(cad,{attributes:true,attributeFilter:['href']});sync();
  }).catch(e=>{$('search-message').textContent=e.message;});
  document.documentElement.classList.remove('lab-boot');
})();
