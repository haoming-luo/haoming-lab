// Persistent editor and matched-condition damper comparison.
export function setupJourney(api){
 const $=id=>document.getElementById(id),say=(a,b)=>api.language()==='zh'?a:b;
 let task='vibration',initialized=false,coldKey='',serial=0,lastDamping=10;
 const tools=$('tools'),picker=document.querySelector('.power-picker');picker.remove();document.body.classList.add('guided','workbench');
 const section=id=>{const d=document.createElement('details');d.id=id;d.open=true;d.innerHTML='<summary></summary>';return d;};
 const route=section('route-tools'),support=section('support-tools'),heat=section('heat-tools');
 const s=tools.querySelector('[data-t="supports"]').closest('.section-top'),h=tools.querySelector('[data-t="loading"]').closest('.section-top');
 while(tools.firstChild&&tools.firstChild!==s)route.append(tools.firstChild);
 while(tools.firstChild&&tools.firstChild!==h)support.append(tools.firstChild);
 while(tools.firstChild&&tools.firstChild!==$('forced-tools'))heat.append(tools.firstChild);
 tools.prepend(picker,route);tools.insertBefore(support,$('forced-tools'));tools.append(heat);
 route.querySelector('.presets').before(route.querySelector('.add'));
 route.querySelector('.add').insertAdjacentHTML('beforeend','<button id="quick-support"></button>');
 tools.insertBefore($('dynamic-tools'),support);$('dynamic-tools').open=true;$('forced-tools').open=false;
 $('dynamic-tools').insertAdjacentHTML('afterbegin','<div class="damper-heading"><strong id="damper-heading"></strong><button id="toggle-damper"></button></div>');
 $('dynamic-tools').insertAdjacentHTML('beforeend','<p id="damper-principle" class="hint"></p>');
 $('forced-tools').insertAdjacentHTML('beforeend','<button id="find-resonance"></button>');
 const menu=document.createElement('details');menu.id='file-menu';menu.innerHTML='<summary id="file-label"></summary><div></div>';document.querySelector('header nav').prepend(menu);
 for(const id of ['save-project','open-project','undo','redo'])menu.querySelector('div').append($(id));
 const bar=document.querySelector('.engineering-tabs');bar.insertAdjacentHTML('beforeend','<span id="workflow-line"></span>');
 $('viewport').insertAdjacentHTML('beforeend','<div id="frequency-strip"></div><div id="view-choice"><button id="view-current"></button><button id="view-reference"></button><button id="view-overlay"></button></div>');
 document.body.dataset.compare='current';for(const mode of ['current','reference','overlay'])$('view-'+mode).onclick=()=>{document.body.dataset.compare=mode;sync();};
 $('trace-panel').insertAdjacentHTML('beforeend','<button id="chart-toggle" aria-expanded="true"></button>');
 $('chart-toggle').onclick=()=>{const folded=$('trace-panel').classList.toggle('folded');$('chart-toggle').setAttribute('aria-expanded',String(!folded));sync();};
 const outcome=document.createElement('section');outcome.id='journey-outcome';outcome.innerHTML='<div id="outcome-cards" aria-live="polite"></div><button id="takeaway"></button>';document.querySelector('main').after(outcome);
 $('takeaway').onclick=()=>api.report();
 $('quick-support').onclick=()=>{support.open=true;api.station(api.design().route.length);support.scrollIntoView({block:'nearest',behavior:'smooth'});$('support').focus();};
 $('toggle-damper').onclick=()=>{const p=api.design();if(p.damper.c){lastDamping=p.damper.c/1000;p.damper.c=0;}else p.damper.c=lastDamping*1000;api.view('forced');api.edit(p);};
 $('find-resonance').onclick=()=>{const p=api.design(),r=api.result();if(!r||api.pending())return;const peak=r.harmonic?.sweep.reduce((a,b)=>b.withoutDamper>a.withoutDamper?b:a);p.excitation.frequency=+(peak?.frequency||r.frequency[0]).toFixed(4);api.view('forced');api.edit(p);};
 $('trace').onclick=e=>{const h=api.result()?.harmonic;if(!h||api.pending())return;const box=$('trace').getBoundingClientRect(),f=Math.max(0,Math.min(1,(e.clientX-box.left-36)/(box.width-48))),p=api.design();p.excitation.frequency=+(h.sweep[0].frequency+f*(h.sweep.at(-1).frequency-h.sweep[0].frequency)).toFixed(4);api.view('forced');api.edit(p);};
 $('thermal-task').onclick=()=>choose('thermal');$('vibration-task').onclick=()=>choose('vibration');
 function choose(next){task=next;document.body.dataset.journey=task;$('scale').value=task==='thermal'?'10':'30';api.view(task==='thermal'?'static':'forced');api.edit(api.design());sync();}
 function sync(){
  const p=api.design(),r=api.result(),vib=task==='vibration',busy=api.pending();document.body.dataset.journey=task;
  $('vibration-task').textContent=say('搭管路 · 看减振','Build & control vibration');$('thermal-task').textContent=say('热位移','Thermal movement');bar.prepend($('vibration-task'));
  $('vibration-task').classList.toggle('active',vib);$('thermal-task').classList.toggle('active',!vib);$('scope-note').hidden=true;
  $('workflow-line').textContent=say('搭管路 → 设置振源 → 加装阻尼器 → 比较振幅','Build → Excite → Add damping → Compare');
  route.querySelector('summary').textContent=say('管路搭建','Pipe builder')+` · ${p.route.length}/10`;support.querySelector('summary').textContent=say('支撑与约束','Supports & restraints');heat.querySelector('summary').textContent=say('温升与自重','Heating & gravity');
  $('quick-support').textContent=say('+ 支撑','+ Support');$('damper-heading').textContent=say('阻尼器','Viscous damper');$('toggle-damper').textContent=say(p.damper.c?'移除':'加装',p.damper.c?'Remove':'Add');$('toggle-damper').classList.toggle('active',!!p.damper.c);
  $('damper-principle').textContent=say('阻尼器抵抗运动速度，消耗振动能量；不是把管道固定住。','A damper opposes velocity and dissipates vibration energy. It does not lock the pipe.');
  $('find-resonance').textContent=say('试试扫频峰值','Try the sweep peak');$('file-label').textContent=say('工程文件','Project');$('takeaway').textContent=say('导出结果 ↗','Export results ↗');$('takeaway').disabled=busy||!r;
  $('forced-label').textContent=say('振源设置','Excitation settings');$('forced-hint').textContent=say('周期力推动管道。点击右侧扫频图，也可改变激励频率。','A periodic force excites the pipe. Click the sweep chart to change its frequency.');
  $('damper-node').previousElementSibling.textContent=say('安装位置','Damper joint');$('damper-axis').previousElementSibling.textContent=say('作用方向','Damper axis');
  $('play').title=say('动画慢放；下方显示真实计算振幅','Slowed animation; the results show computed amplitudes');
  $('dynamic-tools').hidden=$('forced-tools').hidden=!vib;heat.hidden=vib;$('frequency-strip').hidden=$('view-choice').hidden=!vib;
  $('frequency-strip').textContent=r?say('固有频率  ','Natural frequencies  ')+r.frequency.slice(0,3).map((f,i)=>`f${['₁','₂','₃'][i]} ${f.toFixed(2)}`).join(' · ')+' Hz':'';
  $('scene-title').textContent=say(vib?'把振动降下来。':'管道受热，怎样伸展？',vib?'Bring the vibration down.':'Room for thermal movement.');
  $('scene-caption').textContent=vib?`${say('振源 / 测点','Force / probe')} ${p.excitation.node} · ${'XYZ'[p.excitation.axis]} · ${p.excitation.force} N · ${p.excitation.frequency.toFixed(2)} Hz`:say('调整支撑，观察热位移与支撑力。','Change a support and inspect movement and loads.');
  for(const [mode,a,b]of [['current','当前方案','Current'],['reference','未加阻尼器','No damper'],['overlay','叠加对照','Overlay']]){$('view-'+mode).textContent=say(a,b);$('view-'+mode).classList.toggle('active',document.body.dataset.compare===mode);}
  $('chart-toggle').textContent=say($('trace-panel').classList.contains('folded')?'展开扫频图':'收起',$('trace-panel').classList.contains('folded')?'Show sweep':'Collapse');
  const card=(label,value,unit)=>`<article><span>${label}</span><div><strong>${value}</strong><small>${unit}</small></div></article>`;
  if(vib){const h=r?.harmonic,a=h?.reference.amplitude*1000,b=h?.current.amplitude*1000,delta=a>1e-9?(1-b/a)*100:null,n=x=>Number.isFinite(x)?x.toFixed(3):'—';
   $('outcome-cards').innerHTML=`<article><span>${say('测点振幅 · 未加 / 当前','Probe amplitude · no damper / current')}</span><div><em>${n(a)}</em><i>→</i><strong>${n(b)}</strong><small>mm</small></div></article>`+card(say('减振效果','Amplitude reduction'),delta===null?'—':Math.abs(delta).toFixed(1),'% '+say(delta!==null&&delta<0?'增加':'降低',delta!==null&&delta<0?'increase':'lower'))+card(say('阻尼器力幅值','Damper force amplitude'),n(h?.damperForce/1000),'kN');
  }else if(r)$('outcome-cards').innerHTML=card(say('最大位移','Max. displacement'),(r.maxDisplacement*1000).toFixed(2),'mm')+card(say('最大支撑力','Largest support force'),(Math.max(...r.supportForces.map(f=>Math.hypot(...f)))/1000).toFixed(2),'kN')+card(say('温升','Temperature rise'),p.temperature,'°C');
  $('toggle-damper').disabled=$('find-resonance').disabled=busy||!r;
 }
 async function solved(){
  if(!initialized){initialized=true;const p=api.design(),r=api.result(),node=Array.from({length:p.route.length},(_,i)=>p.route.length-i).find(n=>!['fixed','guide'].includes(p.supports[n]?.type))||p.route.length;p.excitation={node,axis:2,force:1000,frequency:+Math.max(.1,r.frequency[0]).toFixed(4),zeta:.02};p.damper={node,axis:2,c:0};$('scale').value='30';api.view('forced');api.edit(p);return;}
  sync();if(task!=='thermal')return;const p=api.design(),key=JSON.stringify({...p,temperature:0,damper:null,excitation:null});if(key===coldKey)return;coldKey=key;const id=++serial;
  try{const cold={...p,temperature:0},r=await api.compute(cold);if(id===serial)api.baseline(cold,r);}catch{coldKey='';}
 }
 return{sync,solved,task:()=>task,init(){document.body.dataset.journey=task;sync();if(api.result()&&!api.pending())solved();},beforeEdit(){},restoreBaseline(){sync();}};
}
