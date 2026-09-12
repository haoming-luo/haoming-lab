/* Keep the original presentation; only disclose the recorded-result mode. */
(() => {
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
    const sync=()=>{
      const path=cad.getAttribute('href');const url=window.LAB_STATIC_LINKS[path];
      if(url){cad.href=url;cad.download='支架结构.step';}
    };
    new MutationObserver(sync).observe(cad,{attributes:true,attributeFilter:['href']});sync();
  }).catch(e=>{$('search-message').textContent=e.message;});
})();
