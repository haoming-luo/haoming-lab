/* Local-only data adapter: recorded GINO results, never a live inference claim.
 * Classic scripts + embedded gzip data work with both file:// and static hosts.
 * No API server, local storage, cookies or runtime files are used.
 */
(() => {
  'use strict';
  const ready=(async()=>{
    if(typeof DecompressionStream==='undefined')throw Error('请使用支持 gzip 解压的新版 Chrome、Edge 或 Safari。');
    const bytes=Uint8Array.from(atob(window.LAB_PACKED_DATA),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const data=JSON.parse(await new Response(stream).text());
    delete window.LAB_PACKED_DATA;
    const links={};
    for(const [path,content]of Object.entries(data.cad))links[path]=URL.createObjectURL(new Blob([content],{type:'application/step'}));
    for(const row of data.bank)row.cad=links[row.cad];
    window.LAB_STATIC_LINKS=links;
    return data;
  })();
  const ranges={depth:[.015,.032],radius:[.010,.023],waist:[.04,.38],bow:[.005,.03]};
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
  window.LAB_STATIC_READY=ready;
  // Preserve the original viewer's fetch contract while resolving every model
  // and field request locally. External requests are never forwarded here.
  window.fetch=async input=>{
    try{
      const data=await ready;
      const url=new URL(typeof input==='string'?input:input.url,location.href);
      const path=decodeURIComponent(url.pathname);
      if(path.endsWith('/api/bracket/status'))return reply(data.status);
      if(path.endsWith('/api/bracket/search')){
        const limit=Number(url.searchParams.get('limit_mm'));
        if(!(limit>0&&limit<1))return reply({error:'位移限制超出范围。'},409);
        const eligible=data.bank.filter(c=>c.seat_prediction_mm>0&&c.seat_prediction_mm<=limit*.9);
        const selected=eligible.reduce((a,c)=>!a||c.mass_kg<a.mass_kg?c:a,null);
        return reply({selected,eligible_count:eligible.length,candidate_count:data.bank.length,limit_mm:limit,prediction_margin:.1,cached_predictions:true});
      }
      if(path.endsWith('/api/bracket/predict')){
        const target={};
        for(const [key,[lo,hi]]of Object.entries(ranges)){
          const v=Number(url.searchParams.get(key));
          if(!url.searchParams.has(key)||!Number.isFinite(v)||v<lo||v>hi)return reply({error:'参数超出展示范围。'},409);
          target[key]=v;
        }
        const distance=c=>Object.entries(ranges).reduce((sum,[k,[lo,hi]])=>sum+((c.design[k]-target[k])/(hi-lo))**2,0);
        const selected=data.bank.reduce((best,c)=>distance(c)<distance(best)?c:best,data.bank[0]);
        return reply({...selected,cached:true,precomputed:true,matched:distance(selected)<1e-16,requested_design:target});
      }
      const key=Object.keys(data.files).find(k=>path.endsWith('/'+k));
      if(key)return reply(data.files[key]);
      return reply({error:'展示包中没有此资源。'},404);
    }catch(e){return reply({error:e.message},503);}
  };
})();
