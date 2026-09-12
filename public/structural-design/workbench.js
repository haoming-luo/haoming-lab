/* Presentation layer. Shared camera, unchanged model and inference pipeline. */
const main=document.querySelector('main'),stage=document.querySelector('.stage');
document.querySelector('header .eyebrow').textContent='Haoming Luo';
document.querySelector('header h1').textContent='AgentFEM x GINO 智能结构设计实验室';
document.title='AgentFEM x GINO 智能结构设计实验室';
document.querySelector('.intro h2').textContent='承受 10 kN 压力，支撑架能减重多少？';
document.querySelector('.intro p').textContent='工装承力支架 · 控制承载台下沉，减少结构用料';
const brief=document.createElement('div');brief.className='brief';brief.innerHTML='承载台均匀向下 <b>10 kN 静力</b> · 两侧底脚固定 · 高 189 mm<br><span class="context-tags">铝材线弹性示范；下沉上限是设计探索目标，不是行业标准。暂不作强度放行。</span>';
stage.before(brief);
stage.insertAdjacentHTML('beforeend','<div class="scene-label" id="before-label">对照 · 初始支架</div><div class="scene-label right" id="after-label">当前 · 初始支架</div>');
const actions=document.createElement('div');actions.className='scene-actions';actions.innerHTML='<button id="toggle-controls">调节结构</button><span>两图同步旋转 · 相同色标与变形倍数</span><button id="pin-reference">以当前作为对照</button><button id="restore-reference">恢复对照</button>';
stage.after(actions);
const strip=document.createElement('div');strip.className='result-strip';strip.innerHTML='<div><small>结构质量 · 对照 → 当前</small><strong id="compare-mass">—</strong><small id="compare-saving">等待模型载入</small></div><div><small>顶部下沉 · 对照 → 当前</small><strong id="compare-motion">—</strong><small id="compare-deflection">相同载荷下比较</small></div><div class="judgement"><small>与设定的下沉上限比较</small><strong id="compare-pass">—</strong><small id="compare-limit">仅判断位移，不代表强度安全</small></div>';
actions.after(strip);const note=document.createElement('div');note.className='result-note';note.id='comparison-note';strip.after(note);
const modal=document.createElement('dialog');modal.id='method-dialog';modal.innerHTML='<button id="close-method">关闭</button><h2>计算如何变成设计能力</h2><p>AgentFEM 生成结构与位移数据，GINO + 位移修正网络学习新几何的响应，再按位移条件筛选候选。当前搜索不是拓扑优化或全局最优求解。</p>';
document.body.append(modal);modal.append($('learning-evidence'),landscape,document.querySelector('.status'));document.querySelector('.status').style.display='block';
document.querySelector('header a').textContent='数据与方法';document.querySelector('header a').onclick=e=>{e.preventDefault();modal.showModal();};$('close-method').onclick=()=>modal.close();
const controlsAside=document.querySelector('aside');controlsAside.id='structure-controls';
const controlsBackdrop=document.createElement('button');controlsBackdrop.id='controls-backdrop';controlsBackdrop.type='button';controlsBackdrop.tabIndex=-1;controlsBackdrop.setAttribute('aria-label','收起调节面板');document.body.append(controlsBackdrop);
const controlsClose=document.createElement('button');controlsClose.id='close-controls';controlsClose.type='button';controlsClose.textContent='×';controlsClose.setAttribute('aria-label','关闭调节面板');controlsAside.prepend(controlsClose);
const mobileControls=matchMedia('(max-width:650px), (max-height:500px) and (pointer:coarse)');
const controlsToggle=$('toggle-controls');controlsToggle.setAttribute('aria-controls',controlsAside.id);controlsToggle.setAttribute('aria-expanded','false');
function closeControls(){document.body.classList.remove('controls-open');controlsToggle.setAttribute('aria-expanded','false');if(mobileControls.matches)controlsToggle.focus({preventScroll:true});}
controlsToggle.onclick=()=>{const open=!document.body.classList.contains('controls-open');document.body.classList.toggle('controls-open',open);controlsToggle.setAttribute('aria-expanded',String(open));if(open)controlsClose.focus({preventScroll:true});};
controlsClose.onclick=closeControls;controlsBackdrop.onclick=closeControls;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('controls-open'))closeControls();});
mobileControls.addEventListener('change',()=>{if(!mobileControls.matches)closeControls();});
document.querySelector('label[for="limit"]').firstChild.textContent='顶部最多下沉 ';$('search').textContent='寻找更轻支架结构';$('predict').textContent='查看修改后的效果';
const names={depth:'支撑臂基础宽度',radius:'支撑臂基础厚度',waist:'中段收窄程度',bow:'支撑臂上拱量'};
const helps={depth:'完整参考宽度；实际截面随收腰变化。',radius:'完整参考厚度；不是椭圆半轴。',waist:'数值越大，中段越细、用料越少。',bow:'相对直线向上弯起的最大距离。'};
let pending=false,reference=null,currentRecord=null,comparisonSurface=null,highlightArms=false;
for(const [key]of specs){const input=$('p-'+key),label=document.querySelector(`label[for="p-${key}"]`);label.firstChild.textContent=names[key];label.insertAdjacentHTML('afterend',`<small>${helps[key]}</small>`);
if(key==='depth'||key==='radius'){for(const a of ['min','max','value','step'])input[a]=Number(input[a])*2;}
const updateLabel=()=>{$('v-'+key).textContent=input.value+(key==='waist'?'%':' mm');};updateLabel();input.addEventListener('input',()=>{updateLabel();pending=true;strip.classList.add('pending');$('after-label').textContent='当前仍是上次结果 · 修改待预测';note.textContent='参数已修改。点击“查看修改后的效果”更新右图与结果。';highlightArms=true;rebuild();});input.addEventListener('focus',()=>{highlightArms=true;rebuild();});input.addEventListener('blur',()=>{highlightArms=false;rebuild();});}
document.querySelector('[data-mode="metal"]').textContent='看结构';document.querySelector('[data-mode="displacement"]').textContent='看变形';document.querySelector('[data-mode="stress"]').textContent='看应力';
function recordNow(){return {surface:current,mass:Number($('mass').textContent),motion:Number($('motion').textContent)*.01,cad:$('cad').getAttribute('href'),id:active,predicted:!!current?.prediction};}
function updateComparison(){if(!currentRecord||!reference)return;const a=reference,b=currentRecord,lim=committedLimit*.01,save=(1-b.mass/a.mass)*100;comparisonSurface=a.surface;
$('compare-mass').textContent=`${a.mass.toFixed(3)} → ${b.mass.toFixed(3)} kg`;$('compare-motion').textContent=`${a.motion.toFixed(3)} → ${b.motion.toFixed(3)} mm`;
$('compare-saving').textContent=Math.abs(save)<.05?'用料相同':`${save>=0?'减少':'增加'} ${Math.abs(save).toFixed(1)}% 用料`;$('compare-deflection').textContent=`下沉${b.motion>=a.motion?'增加':'减少'} ${Math.abs(b.motion-a.motion).toFixed(3)} mm`;
$('compare-pass').textContent=b.motion<=lim?'满足下沉限制':'超过下沉限制';$('compare-pass').style.color=b.motion<=lim?'var(--cyan)':'#eea06d';$('compare-limit').textContent=`上限 ${lim.toFixed(2)} mm · 非强度判定`;
if(!pending)note.textContent=`${save>.05?'用料减少':save<-.05?'用料增加':'用料不变'}，${b.motion>a.motion+.0001?'下沉增大':b.motion<a.motion-.0001?'下沉减小':'下沉基本不变'}。${b.predicted?'右图为 AI 预测响应。':'右图为有限元响应。'}`;
rebuild();}
const originalShow=showPrediction;showPrediction=async r=>{await originalShow(r);currentRecord=recordNow();pending=false;highlightArms=false;strip.classList.remove('pending');$('after-label').textContent='修改后 · AI 预测';updateComparison();if(document.body.classList.contains('controls-open'))closeControls();};
const originalLoad=load;load=async name=>{await originalLoad(name);currentRecord=recordNow();pending=false;strip.classList.remove('pending');$('after-label').textContent='当前 · 有限元样本';updateComparison();};
const oldPredict=$('predict'),newPredict=oldPredict.cloneNode(true);oldPredict.replaceWith(newPredict);
newPredict.onclick=async()=>{if(!ready||busy)return;busy=true;buttons();$('search-message').textContent='正在生成结构并预测…';try{const q=new URLSearchParams();for(const [k]of specs)q.set(k,Number($('p-'+k).value)/(k==='waist'?100:(k==='depth'||k==='radius')?2000:1000));const r=await api('predict?'+q);await showPrediction(r);$('search-message').textContent=r.cached?'已复用此结构的预测结果。':`预测 ${r.inference_ms.toFixed(0)} ms · 连同几何 ${(r.total_ms/1000).toFixed(1)} 秒`;}catch(e){$('search-message').textContent=e.message;}finally{busy=false;buttons();}};
$('pin-reference').onclick=()=>{if(!currentRecord||pending||busy)return;reference={...currentRecord};$('before-label').textContent=reference.predicted?'对照 · 已保存预测':'对照 · 有限元样本';updateComparison();};
$('restore-reference').onclick=()=>{if(!reference||busy)return;current=reference.surface;active=reference.id;currentRecord={...reference};pending=false;highlightArms=false;strip.classList.remove('pending');$('after-label').textContent='当前 · 已恢复对照';$('cad').href=reference.cad;mode='metal';document.querySelector('[data-mode="stress"]').disabled=reference.predicted;document.querySelectorAll('[data-mode]').forEach(e=>e.classList.toggle('active',e.dataset.mode===mode));$('legend').hidden=true;updateComparison();};
// Draft limit changes never alter the displayed, committed comparison.
function meshArray(surface){if(!surface)return new Float32Array();const data=[];for(const f of surface.triangles){const p=f.map(i=>surface.points[i].map((v,j)=>v+factor*surface.displacement[i][j]));const n=cross(p[1].map((v,j)=>v-p[0][j]),p[2].map((v,j)=>v-p[0][j]));for(let k=0;k<3;k++){const i=f[k],z=surface.points[i][2];const c=highlightArms&&z>.025&&z<.15?[.95,.65,.32]:mode==='metal'?[.64,.72,.77]:color(mode==='stress'?(surface.stress_mpa?.[i]||0)/12:Math.hypot(...surface.displacement[i])/.000030);data.push(...p[k],...n,...c);}}return new Float32Array(data);}
let leftVertices=new Float32Array(),rightVertices=new Float32Array();rebuild=()=>{leftVertices=meshArray(comparisonSurface||current);rightVertices=meshArray(current);dirty=true;};
draw=function(){requestAnimationFrame(draw);if(!dirty||!uniforms)return;dirty=false;const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const half=Math.floor(w/2),aspect=half/h,s=Math.min(2/.38,2*aspect/.36)*zoom,ca=Math.cos(angle),sa=Math.sin(angle),ce=Math.cos(elevation),se=Math.sin(elevation);const m=new Float32Array([s/aspect*ca,-s*sa*se,-sa*ce,0,s/aspect*sa,s*ca*se,ca*ce,0,0,s*ce,-se,0,0,-s*.0945*ce,.0945*se,1]);gl.uniformMatrix4fv(uniforms.transform,false,m);gl.uniform3f(uniforms.light,-.5,-.7,1);for(const [i,vertices]of [leftVertices,rightVertices].entries()){gl.viewport(i*half,0,half,h);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,vertices.length/9);}};
function initializeCompare(){if(!current||!cache.stout){setTimeout(initializeCompare,80);return;}currentRecord=recordNow();reference={...currentRecord};updateComparison();}initializeCompare();
// Linear load normalization: stored fields are at 1 kN; this task is at 10 kN.
const meshAtUnitLoad=meshArray;meshArray=function(surface){const saved=factor;factor*=10;try{return meshAtUnitLoad(surface);}finally{factor=saved;}};
$('limit').max=14;
function units(){const t=(+$('limit').value*.01).toFixed(2)+' mm';if($('limit-value').textContent!==t)$('limit-value').textContent=t;const title=mode==='stress'?'应力 / MPa':'位移幅值 / mm',max=mode==='stress'?'120':'0.30';if($('legend-title').textContent!==title)$('legend-title').textContent=title;if($('legend-max').textContent!==max)$('legend-max').textContent=max;}
new MutationObserver(units).observe($('legend'),{subtree:true,childList:true});$('limit').addEventListener('input',units);units();
modal.insertAdjacentHTML('beforeend','<h2>本次工况：10 kN 静载</h2><p>原始模型与数据以1 kN载荷建立；当前线弹性任务按10倍载荷换算位移和应力，质量不变。已额外真实复算三种结构核对比例关系。该换算不适用于塑性、接触变化或大变形。</p><p>0.10 mm是本演示的设计目标，可自行调整。当前结构的质量和下沉量以主画面对照结果为准。这里展示刚度与用料的取舍，不给出材料屈服或结构安全认证。</p>');
const originalDrawCandidates=drawCandidates;drawCandidates=async(limit,selected)=>{await originalDrawCandidates(limit,selected);const texts=$('candidate-map').querySelectorAll('text');for(const t of texts){if(t.textContent==='预测下移 / μm')t.textContent='预测下沉 / mm';else if(t.getAttribute('x')==='20')t.textContent=(Number(t.textContent)*.01).toFixed(2);}for(const t of $('candidate-map').querySelectorAll('title'))t.textContent=t.textContent.replace(/([\d.]+) μm/,(_,n)=>(+n*.01).toFixed(3)+' mm');};
function syncParameters(d){if(!d)return;for(const [k]of specs){const v=d[k]*(k==='waist'?100:(k==='depth'||k==='radius')?2000:1000);$('p-'+k).value=v;$('v-'+k).textContent=v.toFixed(1)+(k==='waist'?'%':' mm');}}
syncParameters({depth:.028,radius:.02,waist:.08,bow:.008});
const showWithComparison=showPrediction;showPrediction=async r=>{await showWithComparison(r);currentRecord.design=r.design||Object.fromEntries(specs.map(([k])=>[k,Number($('p-'+k).value)/(k==='waist'?100:(k==='depth'||k==='radius')?2000:1000)]));syncParameters(currentRecord.design);units();};
const loadWithComparison=load;load=async name=>{await loadWithComparison(name);currentRecord.design=cache[name]?.summary.design;syncParameters(currentRecord.design);units();};
const apiBeforeUX=api;api=async path=>{const data=await apiBeforeUX(path);if(path.startsWith('search')&&!data.selected){note.textContent='没有候选满足此限制；右图仍是上一方案，请放宽限制。';$('after-label').textContent='上一方案 · 本次无推荐';}return data;};
new ResizeObserver(entries=>{document.querySelector('.layout').style.height=`calc(100dvh - ${entries[0].target.getBoundingClientRect().height}px)`;}).observe(document.querySelector('header'));
rebuild();
const restoreView=$('restore-reference').onclick;$('restore-reference').onclick=()=>{restoreView();syncParameters(reference?.design||cache.stout?.summary.design);units();};
const forceOverlay=document.createElementNS('http://www.w3.org/2000/svg','svg');forceOverlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';stage.append(forceOverlay);
const sceneDraw=draw;draw=function(){sceneDraw();const w=canvas.clientWidth,h=canvas.clientHeight,half=w/2,aspect=half/h,s=Math.min(2/.38,2*aspect/.36)*zoom;const ca=Math.cos(angle),sa=Math.sin(angle),se=Math.sin(elevation),ce=Math.cos(elevation);let parts=[];for(let side=0;side<2;side++){const project=(x,y,z)=>[side*half+half/2*(1+s/aspect*(ca*x+sa*y)),h/2*(1-s*(-sa*se*x+ca*se*y+ce*(z-.0945)))];const [tx,ty]=project(0,0,.189);parts.push(`<path d="M${tx} ${ty-48}V${ty-7}m-5 -8l5 8 5 -8" fill="none" stroke="#e5ac72" stroke-width="2"/><text x="${tx+8}" y="${ty-30}" fill="#e5ac72" font-size="11">10 kN</text>`);for(const fx of [-.12,.12]){const [x,y]=project(fx,0,0);parts.push(`<path d="M${x-15} ${y+8}h30m-26 0l-5 7m14 -7l-5 7m14 -7l-5 7" fill="none" stroke="#72d6d1"/><text x="${x}" y="${y+29}" text-anchor="middle" fill="#72d6d1" font-size="10">固定</text>`);}}forceOverlay.setAttribute('viewBox',`0 0 ${w} ${h}`);forceOverlay.innerHTML=parts.join('');};
document.querySelectorAll('aside>div.block').forEach(el=>el.remove());
drawCandidates(10).catch(()=>{});
$('deform').max=100;$('deform').step=10;
const busyControls=buttons;buttons=()=>{busyControls();$('limit').disabled=busy;for(const input of document.querySelectorAll('#parameters input'))input.disabled=busy;$('pin-reference').disabled=busy||pending;$('restore-reference').disabled=busy;};
for(const input of document.querySelectorAll('#parameters input'))input.step='any';
// Display amplification only; physical response values remain unchanged.
factor=100;$('deform').value=100;$('factor').textContent='× 100';
document.querySelector('label[for="deform"]').firstChild.textContent='变形放大（仅显示） ';
rebuild();
// Expanded domain is enabled only with the independently accepted incremental model.
for(const [key,min,max] of [['depth',30,64],['radius',20,46],['waist',4,38],['bow',5,30]]){$('p-'+key).min=min;$('p-'+key).max=max;}
async function reinforcedStart(){
try{
 const [surface,summary]=await Promise.all(['surface','summary'].map(async file=>{const r=await fetch(`expansion_pilot/reinforced/${file}.json`);if(!r.ok)throw Error('厚实对照数据缺失');return r.json();}));
 surface.displacement=surface.displacement.map(v=>v.map(x=>x/10));surface.stress_mpa=surface.stress_mpa.map(x=>x/10);
 summary.seat_mean_displacement_mm/=10;cache.reinforced={surface,summary};await load('reinforced');currentRecord.cad='expansion_pilot/reinforced/geometry.step';$('cad').href=currentRecord.cad;reference={...currentRecord};$('before-label').textContent='厚实对照 · 有限元';$('after-label').textContent='当前 · 厚实方案';updateComparison();
}catch(e){$('error').textContent=e.message;}
}
reinforcedStart();
function visibleScale(){actions.querySelector('span').textContent=`同步旋转 · 变形放大 ×${factor}（仅显示）`;}
$('deform').addEventListener('input',visibleScale);visibleScale();
// Shared camera, time-based speed: identical direction on macOS and Windows.
let autoRotate=false,lastOrbitTime=performance.now();
const rotationButton=document.createElement('button');rotationButton.id='auto-rotate';rotationButton.type='button';
rotationButton.style.cssText='position:absolute;right:8px;top:7px;z-index:2;width:30px;height:30px;display:grid;place-items:center;padding:5px;border-radius:5px;background:#10191ddd';
stage.append(rotationButton);
function rotationState(){
 const label=autoRotate?'暂停自动旋转':'开启自动旋转';rotationButton.title=label;rotationButton.setAttribute('aria-label',label);rotationButton.setAttribute('aria-pressed',String(autoRotate));
 rotationButton.innerHTML=autoRotate?'<svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4v12M13 4v12" stroke="currentColor" stroke-width="2"/></svg>':'<svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.5L16 10L6 16.5Z" fill="currentColor"/></svg>';
}
rotationButton.onclick=()=>{autoRotate=!autoRotate;lastOrbitTime=performance.now();rotationState();};rotationState();
canvas.addEventListener('lostpointercapture',()=>{pointer=null;lastOrbitTime=performance.now();});
window.addEventListener('blur',()=>{pointer=null;lastOrbitTime=performance.now();});
document.addEventListener('visibilitychange',()=>{lastOrbitTime=performance.now();});
const drawWithAnnotations=draw;draw=function(){
 const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-lastOrbitTime)/1000));lastOrbitTime=now;
 if(autoRotate&&!pointer&&!document.hidden&&!document.querySelector('dialog[open]')){angle-=dt*.12;dirty=true;}
 drawWithAnnotations();
};
