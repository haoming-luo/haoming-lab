/* Scientific architecture diagrams; topology follows the published model.
   Circle counts in generic MLP schematics are illustrative, not layer widths. */
(() => {
  const NS='http://www.w3.org/2000/svg';
  let current=5, paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C={physics:'#83d5ca',learned:'#e3ad78',muted:'#799397',line:'#334b51',ink:'#edf2ed'};
  const t=(zh,en)=>document.documentElement.lang==='en'?en:zh;
  function el(p,tag,attrs={},text=''){const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;p.append(n);return n;}
  function text(p,x,y,value,size=13,color=C.ink,anchor='middle'){return el(p,'text',{x,y,'font-size':size,fill:color,'text-anchor':anchor},value);}
  function wire(p,d,kind='physics',dashed=false){el(p,'path',{d,fill:'none',stroke:C[kind]||C.line,'stroke-width':1.3,opacity:.46,'marker-end':'url(#arrow-'+kind+')'}); if(!dashed)el(p,'path',{d,fill:'none',stroke:C[kind]||C.line,'stroke-width':2,'stroke-dasharray':'5 95',pathLength:100,class:'signal'});}
  function box(p,x,y,w,h,label,formula,kind='physics',detail=''){
    const g=el(p,'g',{class:'diagram-module',tabindex:0,role:'button','aria-label':label+' '+formula});
    el(g,'rect',{x:x+5,y:y-5,width:w,height:h,rx:10,fill:'none',stroke:C[kind]||C.line,opacity:.14});
    el(g,'rect',{x,y,width:w,height:h,rx:10,fill:kind==='learned'?'#211d19':'#102126',stroke:C[kind]||C.line,'stroke-opacity':.5});
    text(g,x+12,y+25,label,14,C[kind]||C.muted,'start');
    text(g,x+w/2,y+h/2+11,formula,21);
    if(detail)text(g,x+w/2,y+h-17,detail,12,C.muted);
    const select=()=>{document.querySelectorAll('.diagram-module').forEach(n=>n.classList.remove('selected'));g.classList.add('selected');};
    g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
    return g;
  }
  function network(p,x,y,w,h,labels=['9','24','24','2']){
    const counts=[3,5,5,2],points=counts.map((n,j)=>Array.from({length:n},(_,i)=>[x+j*w/3,y+(i+1)*h/(n+1)]));
    points.slice(0,-1).forEach((a,j)=>a.forEach(u=>points[j+1].forEach(v=>el(p,'line',{x1:u[0],y1:u[1],x2:v[0],y2:v[1],stroke:C.learned,'stroke-width':.65,opacity:.20}))));
    points.forEach((a,j)=>{a.forEach((v,i)=>el(p,'circle',{cx:v[0],cy:v[1],r:4.3,fill:'#211d19',stroke:C.learned,'stroke-width':1.2,class:'neuron','style':'animation-delay:'+(.15*(i+j))+'s'}));text(p,x+j*w/3,y+h+15,labels[j],11,C.learned);});
  }
  function render(index=current){
    current=index;
    const host=document.getElementById('architectureFlow');host.innerHTML='';
    const svg=el(host,'svg',{viewBox:'0 0 1160 470',class:'network-diagram'+(paused?' paused':''),role:'img','aria-label':t('模型架构与状态传递','Model architecture and state propagation')});
    const defs=el(svg,'defs');
    ['physics','learned','line'].forEach(k=>{const m=el(defs,'marker',{id:'arrow-'+k,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'});el(m,'path',{d:'M 1 1 L 9 5 L 1 9',fill:'none',stroke:C[k]});});
    text(svg,30,24,'ARCHITECTURE / '+String(index+1).padStart(2,'0'),10,C.muted,'start');
    text(svg,1130,24,index===5?'918 PARAMETERS / 2 MEMORY CHANNELS':t('信息流与状态更新','INFORMATION FLOW & STATE UPDATE'),10,C.muted,'end');
    if(index===5){
      box(svg,25,175,145,112,t('增量与历史','Increment + history'),'Δε, zₙ','physics','εᵖ, p, α₁, α₂');
      box(svg,215,175,155,112,t('弹性预测','Elastic predictor'),'σᵗʳ = C : εᵉ','physics',t('已知弹性关系','Known elasticity'));
      wire(svg,'M170 231 H215');
      const top=box(svg,440,54,290,110,t('单调硬化','Monotone hardening'),'Rθ(p)','learned',t('12 个饱和模态 + 线性项','12 saturation modes + linear tail'));
      const bottom=el(svg,'g',{class:'diagram-module'});
      el(bottom,'rect',{x:440,y:276,width:290,height:144,rx:10,fill:'#211d19',stroke:C.learned,'stroke-opacity':.5});
      text(bottom,456,299,t('状态相关恢复网络','State-dependent recovery'),12,C.learned,'start');
      network(bottom,472,309,224,69);
      text(svg,585,246,t('可学习硬化演化','LEARNED HARDENING EVOLUTION'),11,C.learned);
      wire(svg,'M370 231 H405 V109 H440','learned');
      wire(svg,'M405 231 V348 H440','learned');
      box(svg,800,175,165,112,t('隐式返回映射','Implicit return map'),'f(σ, z) = 0','physics',t('J2 · 关联流动','J2 · associative flow'));
      wire(svg,'M730 109 H770 V207 H800','learned');
      wire(svg,'M730 348 H770 V255 H800','learned');
      box(svg,1010,175,125,112,t('响应与新状态','Updated response'),'σₙ₊₁','physics','zₙ₊₁');
      wire(svg,'M965 231 H1010');
      wire(svg,'M1072 287 V445 H97 V287');
      text(svg,585,437,t('状态传递至下一增量 · 材料记忆','STATE CARRIED TO THE NEXT INCREMENT'),11,C.physics);
    } else if(index===0){
      box(svg,50,176,190,114,t('当前应变','Current strain'),'εₜ','physics','6 components');
      el(svg,'rect',{x:345,y:83,width:470,height:303,rx:14,fill:'#211d19',stroke:C.learned,'stroke-opacity':.3});
      text(svg,580,117,t('前馈神经网络','FEED-FORWARD NETWORK'),13,C.learned);
      network(svg,390,141,380,170,['ε','hidden','hidden','σ']);
      text(svg,580,365,t('当前输入 → 当前输出','CURRENT INPUT → CURRENT OUTPUT'),11,C.muted);
      box(svg,920,176,190,114,t('当前应力','Current stress'),'σₜ','physics','6 components');
      wire(svg,'M240 233 H345','learned');wire(svg,'M815 233 H920','learned');
      text(svg,580,442,t('没有历史状态传递','NO STATE TRANSFER BETWEEN INCREMENTS'),12,C.muted);
    } else if(index===1||index===2){
      const xs=[250,515,780];
      xs.forEach((x,j)=>{
        text(svg,x+75,84,['t − 1','t','t + 1'][j],13,C.muted);
        box(svg,x,164,160,112,'GRU','h → h′','learned',t('门控状态更新','Gated state update'));
        box(svg,x+16,324,128,72,t('输入','Input'),'ε'+['ₜ₋₁','ₜ','ₜ₊₁'][j],'physics');
        wire(svg,'M'+(x+80)+' 324 V276');
        wire(svg,'M'+(x+80)+' 164 V116');
        text(svg,x+80,105,'σ'+['ₜ₋₁','ₜ','ₜ₊₁'][j],18);
        if(j<2)wire(svg,'M'+(x+160)+' 220 H'+xs[j+1],'learned');
      });
      text(svg,132,225,'h₀',22,C.learned);wire(svg,'M156 220 H250','learned');
      if(index===2){box(svg,25,324,170,72,t('物理状态特征','Physics features'),'p, εᵖ, …','physics');wire(svg,'M195 360 H266');}
      text(svg,585,450,index===1?t('历史被压缩进隐状态 h','HISTORY ENCODED IN HIDDEN STATE h'):t('物理特征进入网络，状态更新由网络学习','PHYSICS FEATURES IN · LEARNED STATE UPDATE'),12,C.muted);
    } else {
      box(svg,35,173,175,119,t('增量与历史','Increment + history'),'Δε, zₙ','physics');
      box(svg,265,173,190,119,t('力学骨架','Mechanical skeleton'),'Elasticity + J2','physics');
      box(svg,515,173,230,119,index===3?t('完整演化方程','Known evolution law'):t('不完备硬化','Incomplete hardening'),index===3?'J2 / Chaboche':'R(p), α','physics',index===3?t('神经参数识别','Neural parameter identification'):t('有限的记忆表达','Limited memory representation'));
      box(svg,805,173,145,119,t('返回映射','Return map'),'f = 0','physics');
      box(svg,1000,173,135,119,t('应力与状态','Stress + state'),'σₙ₊₁, zₙ₊₁','physics');
      [[210,265],[455,515],[745,805],[950,1000]].forEach(([a,b])=>wire(svg,'M'+a+' 231 H'+b));
      wire(svg,'M1067 292 V397 H122 V292');
      text(svg,580,424,t('显式内部变量沿加载路径更新','EXPLICIT INTERNAL VARIABLES EVOLVE ALONG THE PATH'),12,C.physics);
      if(index===3)text(svg,630,128,t('正确演化形式已知','GOVERNING FORM KNOWN'),12,C.learned);
      else text(svg,630,128,t('缺少神经闭合','NO LEARNED CLOSURE'),12,C.muted);
    }
    const btn=document.getElementById('flowMotion');btn.textContent=paused?t('播放流动','Play flow'):t('暂停流动','Pause flow');btn.setAttribute('aria-pressed',String(!paused));
    btn.onclick=()=>{paused=!paused;render();};
  }
  window.DenimArchitecture={render};
  document.addEventListener('denim-language',()=>render());
})();
