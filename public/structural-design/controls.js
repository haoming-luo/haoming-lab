/* The page never substitutes FEM presets for a failed neural prediction. */
const panel=document.createElement('section');panel.className='block';panel.style.margin='0 0 28px';
panel.innerHTML=`<h2>你的设计要求</h2><label for="limit">允许下移 <span id="limit-value">10 μm</span></label><input id="limit" type="range" min="4" max="24" step="1" value="10"><button id="search" disabled style="width:100%;margin-top:10px">寻找更轻方案</button><p id="search-message" aria-live="polite">正在读取模型状态…</p><details><summary style="font-size:12px;cursor:pointer">自己调整结构</summary><div id="parameters" class="block"></div><button id="predict" disabled style="width:100%">预测这个结构</button></details>`;
const presets=document.querySelector('.designs'),presetTitle=presets.previousElementSibling;
const presetDetails=document.createElement('details');presetDetails.style.marginBottom='20px';presetDetails.innerHTML='<summary style="font-size:12px;cursor:pointer;margin-bottom:12px">查看三种有限元样本</summary>';
presetTitle.before(presetDetails);presetDetails.append(presets);presetTitle.remove();
document.querySelector('aside').prepend(panel);
const specs=[['depth','横向半宽',18,28,22,1],['radius','厚度半轴',12,20,15,1],['waist','收腰比例',8,36,22,1],['bow','弧线抬高',5,25,15,1]];
for(const [key,name,min,max,value,step]of specs){const row=document.createElement('div');row.className='control';row.style.marginBottom='16px';row.innerHTML=`<label for="p-${key}">${name}<span id="v-${key}">${value}${key==='waist'?'%':' mm'}</span></label><input id="p-${key}" type="range" min="${min}" max="${max}" value="${value}" step="${step}">`;$('parameters').append(row);$('p-'+key).addEventListener('input',e=>$('v-'+key).textContent=e.target.value+(key==='waist'?'%':' mm'));}
const statusText=document.querySelector('.status');const evidence=document.createElement('div');evidence.id='learning-evidence';evidence.style.cssText='margin:8px 0;font-size:11px;color:var(--muted);line-height:1.7';document.querySelector('.intro').after(evidence);
let ready=false,busy=false,committedLimit=Number($('limit').value);
async function api(path){const r=await fetch('/api/bracket/'+path);const data=await r.json();if(!r.ok)throw Error(data.error||'请求未完成');return data;}
function buttons(){for(const id of ['search','predict'])$(id).disabled=!ready||busy;}
async function poll(){try{const s=await api('status');ready=s.state==='ready';$('learning-evidence').textContent=`AgentFEM：${s.computed} 种结构（64 训练 / 12 验证 / 12 测试）＋ ${s.confirmation_geometries||0} 种追加确认 · ${s.candidate_geometries} 个候选 · GINO + 位移修正网络`;
if(ready)statusText.firstChild.textContent='AgentFEM 批量计算 → 三维场数据 → GINO 预测 → 候选搜索。预设样本为有限元结果；预测方案在画面上单独标注。';
if(!busy)$('search-message').textContent=ready?'限定允许位移，在候选中寻找更轻结构。':s.state==='failed'?'训练流程未完成：'+s.error:s.state==='needs_improvement'?'GINO 独立验证尚未达标，预测与搜索暂未开放。':s.state==='evaluating'?'正在检查独立结构上的预测精度。':s.state==='preparing_candidates'?'独立检查通过，正在预测新候选。':'新版数据与 GINO 训练进行中，预测与搜索尚未开放。';buttons();}catch(e){$('search-message').textContent='请通过实验室服务入口打开本页。';}if(!ready)setTimeout(poll,10000);}
async function showPrediction(r){
    ++request;const response=await fetch(r.surface);if(!response.ok)throw Error('预测表面加载失败');current=await response.json();active=r.id;mode='displacement';
    document.querySelectorAll('[data-design]').forEach(el=>el.classList.remove('active'));
    document.querySelectorAll('[data-mode]').forEach(el=>el.classList.toggle('active',el.dataset.mode===mode));document.querySelector('[data-mode="stress"]').disabled=true;
    $('legend').hidden=false;$('legend-title').textContent='预测位移幅值 / μm';$('legend-max').textContent='30';
    const base=cache.stout.summary;$('mass').textContent=r.mass_kg.toFixed(3);$('motion').textContent=(r.seat_prediction_mm*1000).toFixed(2);$('stiffness').textContent=r.seat_prediction_mm>0?(1/r.seat_prediction_mm).toFixed(1):'—';
    $('mass-delta').textContent=`较基准 ${(100*(r.mass_kg/base.mass_kg-1)).toFixed(1)}%`;$('motion-delta').textContent='GINO 预测，非本次有限元求解';$('cad').href=r.cad;
    document.querySelector('.stamp').textContent='GINO + 位移修正 · 预测';$('takeaway').textContent='通过新几何的点云预测位移场；重量来自实体 CAD。当前未开放预测应力及强度判定。';rebuild();
}
async function searchNow(){if(!ready||busy)return;const requestedLimit=$('limit').value;busy=true;buttons();$('search-message').textContent='正在评估候选…';try{const limit=Number(requestedLimit);const data=await api('search?limit_mm='+limit/1000);
await drawCandidates(limit,data.selected?.id);
if(data.selected){committedLimit=limit;await showPrediction(data.selected);$('search-message').textContent=`${data.candidate_count} 个候选中 ${data.eligible_count} 个满足预测条件，显示其中最轻者。${data.cached_predictions?'已复用 GINO 预测。':''}`;$('takeaway').textContent=`允许下移 ${limit} μm，搜索保留 10% 预测余量。改变限制，推荐方案可能随之变化。此结果只代表已评估候选，不代表全局最优。`;}
else{$('search-message').textContent='当前候选没有满足此位移限制的方案。';$('takeaway').textContent='当前显示的是上一结构，不是满足新要求的推荐。可放宽限制或扩展结构范围。';}
}catch(e){$('search-message').textContent=e.message;}finally{busy=false;buttons();}}
$('limit').addEventListener('input',()=>{$('limit-value').textContent=$('limit').value+' μm';$('search-message').textContent='条件已调整，点击“寻找更轻支架结构”后更新结果。';});$('search').addEventListener('click',searchNow);
$('predict').addEventListener('click',async()=>{if(!ready||busy)return;busy=true;buttons();$('search-message').textContent='正在生成实体并进行 GINO 预测…';try{const q=new URLSearchParams();for(const [key]of specs)q.set(key,Number($('p-'+key).value)/(key==='waist'?100:1000));const r=await api('predict?'+q.toString());await showPrediction(r);$('search-message').textContent=r.cached?'复用本结构的 GINO 预测。':`GINO 推理 ${r.inference_ms.toFixed(0)} ms · 含 CAD 与表面网格 ${ (r.total_ms/1000).toFixed(1)} s`;}catch(e){$('search-message').textContent=e.message;}finally{busy=false;buttons();}});
document.querySelectorAll('[data-design]').forEach(el=>el.addEventListener('click',()=>{document.querySelector('[data-mode="stress"]').disabled=false;document.querySelector('.stamp').textContent='真实有限元数据 · 几何试验版';}));
const landscape=document.createElement('section');landscape.style.cssText='border-top:1px solid var(--line);margin-top:22px;padding-top:18px';landscape.innerHTML='<h2>一次学习，探索更多结构</h2><p>每个点是一种新结构：越靠左越轻，越靠下越不易变形。青色为满足当前预测条件的候选，金色为推荐。</p><svg id="candidate-map" viewBox="0 0 600 200" role="img" aria-label="候选结构的质量与预测位移分布" style="width:100%;max-height:230px"></svg><p id="model-evidence">64 个训练结构 · 12 个验证结构 · 12 个测试结构。独立测试平均位移场误差 4.01%。模型为 GINO + 位移修正。</p>';
document.querySelector('.status').before(landscape);
let candidateData;
async function drawCandidates(limit,selected){
if(!candidateData){const r=await fetch('hybrid_expanded/candidate_bank.json');if(!r.ok)return;candidateData=await r.json();}
const xs=candidateData.map(c=>c.mass_kg),ys=candidateData.map(c=>c.seat_prediction_mm*1000),lo=Math.min(...xs)-.025,hi=Math.max(...xs)+.025,ymax=Math.max(...ys)*1.2;
const x=v=>48+(v-lo)/(hi-lo)*526,y=v=>163-v/ymax*143,threshold=limit*.9;
let svg='<path d="M48 20V163H574" fill="none" stroke="#657476"/>';
if(threshold<ymax)svg+=`<path d="M48 ${y(threshold)}H574" stroke="#72d6d1" stroke-dasharray="4 5" opacity=".5"/>`;
for(const c of candidateData){const chosen=c.id===selected,ok=c.seat_prediction_mm*1000<=threshold;svg+=`<circle cx="${x(c.mass_kg)}" cy="${y(c.seat_prediction_mm*1000)}" r="${chosen?6:3.5}" fill="${chosen?'#e8ab70':ok?'#72d6d1':'#475154'}" ${chosen?'stroke="#fff" stroke-width="1.5"':''}><title>${c.id}: ${c.mass_kg.toFixed(3)} kg / ${(c.seat_prediction_mm*1000).toFixed(2)} μm</title></circle>`;}
svg+=`<g fill="#929b9d" font-size="11"><text x="48" y="14">预测下移 / μm</text><text x="490" y="193">质量 / kg →</text><text x="48" y="180">${lo.toFixed(2)}</text><text x="549" y="180">${hi.toFixed(2)}</text><text x="20" y="27">${ymax.toFixed(0)}</text><text x="30" y="163">0</text></g>`;$('candidate-map').innerHTML=svg;
}
poll();
drawCandidates(10).catch(()=>{});
