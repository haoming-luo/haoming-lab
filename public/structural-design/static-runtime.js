/* Static on-demand archive adapter. No live GINO inference or backend. */
(() => {
  'use strict';
  const nativeFetch=window.fetch.bind(window);
  const base=new URL('.',document.currentScript.src);
  const pending=new Map();
  async function asset(path,text=false){
    const url=new URL(path,base).href;
    if(!pending.has(url))pending.set(url,(async()=>{
      const response=await nativeFetch(url);if(!response.ok)throw Error('数据加载失败，请重试。');
      const content=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).text();
      return text?content:JSON.parse(content);
    })().catch(error=>{pending.delete(url);throw error;}));
    return pending.get(url);
  }
  const ready=(async()=>{
    if(typeof DecompressionStream==='undefined')throw Error('请使用支持 gzip 解压的新版 Chrome、Edge 或 Safari。');
    const response=await nativeFetch(new URL('assets/index.json',base));
    if(!response.ok)throw Error('展示目录加载失败，请刷新重试。');
    const data=await response.json();
    const links={};
    for(const [path,file]of Object.entries(data.cad))links[path]=new URL(file,base).href;
    for(const row of data.bank)row.cad=links[row.cad];
    window.LAB_STATIC_LINKS=links;
    const cadBlobs=new Map();
    window.LAB_GET_CAD=async path=>{
      const url=links[path]||path;
      if(!Object.values(links).includes(url))throw Error('未找到此结构的 CAD。');
      if(!cadBlobs.has(url))cadBlobs.set(url,URL.createObjectURL(new Blob([await asset(url,true)],{type:'application/step'})));
      return cadBlobs.get(url);
    };
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
      if(key)return reply(await asset(data.files[key]));
      return reply({error:'展示包中没有此资源。'},404);
    }catch(e){return reply({error:e.message},503);}
  };
})();
