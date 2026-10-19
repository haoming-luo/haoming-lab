// Task-led presentation. Every comparison uses solved operators, never staged values.
export function setupJourney(api){
 const $=id=>document.getElementById(id),zh=()=>api.language()==='zh',say=(a,b)=>zh()?a:b;
 let task='build',busy=false,serial=0,referenceKey='',referenceName='cold',baselineResult=null,started=false,geometryKey='';
 const panel=document.createElement('aside');panel.id='journey';
 panel.innerHTML=`<div id="journey-service"></div><div class="journey-kicker" id="journey-kicker"></div><h2 id="journey-title"></h2><p id="journey-intro"></p><div class="journey-steps"><span id="step-one"></span><span id="step-two"></span><span id="step-three"></span></div><section id="thermal-story"><label class="journey-input"><span id="heat-label"></span><div><input id="journey-heat" type="number" min="0" max="600" step="10"><span>°C</span></div></label><p class="journey-note" id="heat-note"></p><button class="journey-primary" id="show-heat"></button><div class="journey-divider"></div><label class="journey-input"><span id="support-point-label"></span><select id="journey-node"></select></label><span class="journey-label" id="support-choice-label"></span><div id="support-choices"><button data-restraint="none"></button><button data-restraint="spring"></button><button data-restraint="guide"></button><button data-restraint="fixed"></button></div><p class="journey-note" id="support-explainer"></p></section><section id="vibration-story" hidden><p class="excitation-badge" id="excitation-badge"></p><button class="journey-primary" id="show-vibration"></button><button class="journey-secondary" id="toggle-damper"></button><p class="journey-note" id="damper-note"></p><div class="journey-divider"></div><button class="journey-link" id="adjust-vibration"></button><button class="journey-link" id="show-sweep"></button></section><div class="journey-bottom"><button id="edit-pipe"></button><span id="part-count"></span></div></aside>`;
 $('tools').before(panel);$('journey-service').append(document.querySelector('.power-picker'));
 $('viewport').insertAdjacentHTML('beforeend','<div class="split-labels"><span id="split-before"></span><span id="split-after"></span></div>');
 const tools=$('tools');tools.setAttribute('aria-label','Engineering tools');tools.insertAdjacentHTML('afterbegin','<div class="tools-heading"><strong id="tools-title"></strong><button id="close-tools" aria-label="Close">×</button></div>');
 const scrim=document.createElement('button');scrim.id='tools-scrim';scrim.setAttribute('aria-label','Close controls');scrim.hidden=true;document.body.append(scrim);
 const outcome=document.createElement('section');outcome.id='journey-outcome';outcome.setAttribute('aria-live','polite');outcome.innerHTML='<div class="outcome-heading"><span id="comparison-label"></span><strong id="comparison-title"></strong><button id="reset-reference"></button></div><div id="outcome-cards"></div><div class="outcome-actions"><button id="takeaway"></button><small id="outcome-note"></small></div>';document.querySelector('main').after(outcome);
 const filemenu=document.createElement('details');filemenu.id='file-menu';filemenu.innerHTML='<summary id="file-label"></summary><div></div>';document.querySelector('header nav').prepend(filemenu);for(const id of ['save-project','open-project','undo','redo'])filemenu.querySelector('div').append($(id));
 document.body.classList.add('guided');
 document.querySelector('.engineering-tabs').insertAdjacentHTML('afterbegin','<button id="build-task"></button>');
 const add=document.querySelector('#tools .add');
 document.querySelector('#tools .presets').before(add);
 add.insertAdjacentHTML('beforeend','<button id="build-support"></button>');
 const loading=document.querySelector('[data-t="loading"]').closest('.section-top'),extra=document.createElement('div');extra.id='calculation-tools';loading.before(extra);
 while(extra.nextSibling)extra.append(extra.nextSibling);
 $('tools-title').parentElement.insertAdjacentHTML('afterend','<p id="build-hint" class="hint"></p>');
 $('viewport').insertAdjacentHTML('beforeend','<div id="build-next"><span id="build-count"></span><button id="build-thermal"></button></div>');
 $('build-task').onclick=()=>choose('build');
 $('build-thermal').onclick=()=>choose('thermal');
 $('build-support').onclick=()=>{api.station(api.design().route.length);$('support').scrollIntoView({block:'nearest',behavior:'smooth'});$('support').focus();};

 $('review-dialog').querySelector('h2').after(document.querySelector('.report-actions'));
 function editor(open=true){if(task==='build'){tools.scrollTo({top:0});return;}document.body.classList.toggle('editor-open',open);scrim.hidden=!open;if(open)$('close-tools').focus();else $('edit-pipe').focus();}
 $('edit-pipe').onclick=()=>editor();$('close-tools').onclick=()=>editor(false);scrim.onclick=()=>editor(false);$('toggle-tools').onclick=()=>editor(!document.body.classList.contains('editor-open'));
 document.addEventListener('keydown',e=>{if(!document.body.classList.contains('editor-open'))return;if(e.key==='Escape'){editor(false);return;}if(e.key==='Tab'){const all=[...tools.querySelectorAll('button,select,input,summary,a')].filter(el=>!el.disabled&&el.getClientRects().length),first=all[0],last=all.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
 $('adjust-vibration').onclick=()=>{editor();$('forced-tools').open=true;$('forced-tools').scrollIntoView({block:'start'});};
 $('show-sweep').onclick=()=>{document.body.classList.toggle('sweep-open');sync();};
 function change(p){api.edit(p);sync();}
 function captureCurrent(){const r=api.result();if(r&&!api.pending()){serial++;busy=false;baselineResult=structuredClone(r);referenceName='before';api.baseline(api.design(),baselineResult);}}
 $('show-heat').onclick=()=>{if(busy||api.pending())return;const p=api.design(),n=+$('journey-heat').value;if(!Number.isFinite(n)||n<0||n>(p.diameter>=.45?600:200)){$('journey-heat').reportValidity();return;}p.temperature=n;referenceName='cold';referenceKey='';started=true;api.view('static');change(p);api.animateHeat();};
 $('journey-node').onchange=()=>{api.station(+$('journey-node').value);sync();};
 for(const b of document.querySelectorAll('[data-restraint]'))b.onclick=()=>{if(busy||api.pending())return;captureCurrent();const p=api.design(),node=+$('journey-node').value;p.supports[node]={type:b.dataset.restraint,k:100000};started=true;change(p);};
 $('show-vibration').onclick=()=>{if(api.pending())return;const p=api.design(),r=api.result();const node=Array.from({length:p.route.length},(_,i)=>p.route.length-i).find(n=>!['fixed','guide'].includes(p.supports[n]?.type))||p.route.length;p.excitation={node,axis:2,force:1000,frequency:+Math.max(.1,r.frequency[0]).toFixed(3),zeta:.02};p.damper={node,axis:2,c:0};started=true;api.view('forced');change(p);};
 $('toggle-damper').onclick=()=>{if(api.pending())return;const p=api.design();p.damper.c=p.damper.c?0:10000;api.view('forced');change(p);};
 $('reset-reference').onclick=()=>{captureCurrent();sync();};
 $('takeaway').onclick=()=>api.report();
 $('thermal-task').onclick=()=>choose('thermal');$('vibration-task').onclick=()=>choose('vibration');
 function choose(value){document.body.classList.remove('editor-open');scrim.hidden=true;task=value;started=false;document.body.dataset.journey=task;document.body.classList.remove('sweep-open');$('scale').value=task==='thermal'?'10':'30';api.view(task==='vibration'?'0':'static');if(task==='vibration'&&!api.pending()&&api.result())$('show-vibration').click();sync();}
 const supportHelp={none:['此处不施加支撑力，观察它可以移动多远。','No support force here. Observe the available movement.'],spring:['竖向可以移动；移动越多，弹簧力越大。','Vertical movement is allowed; spring force grows with travel.'],guide:['上下均不允许移动；水平方向仍可移动。','Vertical movement is blocked in both directions; horizontal movement is free.'],fixed:['此处不能平移或转动；同时观察增加的约束力。','Translation and rotation are blocked. Watch the resulting reaction force.']};
 function sync(){
  const p=api.design(),r=api.result();if(!p.route.length)return;
  const build=task==='build',vib=task==='vibration',calculating=busy||api.pending();document.body.dataset.journey=task;
  const service=document.querySelector('.power-picker'),host=build?tools:$('journey-service');
  if(service.parentElement!==host){if(build)$('build-hint').after(service);else host.append(service);}
  $('build-task').textContent=say('01  搭建管道','01  Build pipe');
  $('build-task').classList.toggle('active',build);
  $('build-support').textContent=say('+ 支撑','+ Support');
  $('build-hint').textContent=say('接上直管或弯头，点选组件修改尺寸与方向。','Connect a straight or elbow. Select a part to change its size and direction.');
  $('build-count').textContent=say('已搭建 ','Built ')+p.route.length+say(' / 10 个组件',' / 10 parts');
  $('build-thermal').textContent=say('搭好了，看受热位移 →','Ready? Explore thermal movement →');
  $('build-thermal').disabled=calculating||!r;
  const labels={'thermal-task':say('02  受热位移','02  Thermal movement'),'vibration-task':say('03  阻尼器减振','03  Vibration control'),'journey-kicker':say(vib?'振动治理 / 演示':'热膨胀 / 演示',vib?'VIBRATION / DEMO':'THERMAL EXPANSION / DEMO'),'journey-title':say(vib?'加一个阻尼器，\n振幅会变多少？':'管道受热后，\n往哪里伸？',vib?'Add a damper.\nSee the difference.':'Heat the pipe.\nSee where it moves.'),'journey-intro':say(vib?'同一振源、同一测点，直接比较加装前后。':'先看受热位移，再改变支撑，比较位移与受力。',vib?'Same force. Same probe. Compare before and after.':'See the movement, then change a support and compare the loads.'),'step-one':say('选工况','Choose'),'step-two':say('看变化','Explore'),'step-three':say('带走结果','Export'),'heat-label':say('比冷态升高','Temperature rise'),'heat-note':say('整条管壁均匀升温；动画展示静力变形。','Uniform wall heating; the animation illustrates a static solution.'),'show-heat':say('查看受热位移','Show heated pipe'),'support-point-label':say('试着改变支撑','Change a support'),'support-choice-label':say('该位置如何约束？','How is this joint restrained?'),'show-vibration':say('查看原始振动','Show vibration without a damper'),'toggle-damper':say(p.damper.c?'移除阻尼器':'加装阻尼器',p.damper.c?'Remove damper':'Add damper'),'damper-note':say('先看原始振动，再加装阻尼器。动画慢放，数值为计算振幅。','Start without a damper, then add one. Playback is slowed; amplitudes are computed.'),'adjust-vibration':say('调整振源、位置与阻尼参数','Edit force, location & damping'),'show-sweep':say(document.body.classList.contains('sweep-open')?'收起扫频曲线':'查看不同频率下的效果',document.body.classList.contains('sweep-open')?'Hide frequency sweep':'Explore the frequency sweep'),'edit-pipe':say('编辑管路与支撑','Edit route & supports'),'tools-title':say('管路与计算设置','Route & calculation settings'),'file-label':say('工程文件','Project'),'takeaway':say('查看与导出结果','Review & export'),'reset-reference':say('以当前方案重新对照','Use current as reference')};
  for(const [id,text]of Object.entries(labels))$(id).textContent=text;
  if(build){$('scene-title').textContent=say('搭一条你的管路','Build your pipe route');$('scene-caption').textContent=say('直管、弯头、支撑，自由组合。','Connect straights, elbows and supports.');$('tools-title').textContent=say('搭建管道','Build pipe');}
  $('thermal-story').hidden=vib;$('vibration-story').hidden=!vib;
  $('split-before').textContent=say('未加阻尼器','NO ADDED DAMPER');$('split-after').textContent=say(p.damper.c?'已加阻尼器':'当前：未加装',p.damper.c?'DAMPER ADDED':'CURRENT: NO DAMPER');
  $('thermal-task').classList.toggle('active',task==='thermal');$('vibration-task').classList.toggle('active',vib);
  if(document.activeElement!==$('journey-heat'))$('journey-heat').value=p.temperature;$('journey-heat').max=p.diameter>=.45?600:200;
  const node=Math.min(p.route.length,+$('journey-node').value||p.route.length);$('journey-node').replaceChildren(...p.route.map((_,i)=>new Option(say('连接点 ','Joint ')+(i+1)+(i+1===p.route.length?say(' · 末端',' · end'):''),i+1)));$('journey-node').value=node;
  const type=p.supports[node]?.type||'none';document.querySelectorAll('[data-restraint]').forEach(b=>{b.textContent=({none:say('无支撑','Free'),spring:say('弹簧支撑','Spring'),guide:say('竖向限位','Vertical stop'),fixed:say('固定点','Anchor')})[b.dataset.restraint];b.classList.toggle('active',b.dataset.restraint===type);b.disabled=calculating;});
  $('support-explainer').textContent=supportHelp[type][zh()?0:1];$('part-count').textContent=`${p.route.length} / 10 `+say('组件','parts');
  $('excitation-badge').textContent=(started?`${p.excitation.force} N · ${p.excitation.frequency.toFixed(3)} Hz · `+say('测点 ','Probe ')+`${p.excitation.node} / ${'XYZ'[p.excitation.axis]}`:say('示例：末端竖向周期力，频率取一阶固有频率。','Example: vertical end force at the first natural frequency.'));
  ['show-heat','show-vibration','takeaway','reset-reference'].forEach(id=>$(id).disabled=calculating||!r);$('toggle-damper').disabled=calculating||!r?.harmonic||!started;
  $('comparison-label').textContent=calculating?say('计算中…','Calculating…'):say('自动对照 · 真实计算量','AUTOMATIC COMPARISON · COMPUTED VALUES');
  $('comparison-title').textContent=vib?say('未加阻尼器 → 当前配置','No added damper → current setup'):say(referenceName==='cold'?'冷态 → 受热后':'改动前 → 当前方案',referenceName==='cold'?'Cold → heated':'Before edit → current');
  $('reset-reference').hidden=vib;
  const card=(title,a,b,unit)=>`<article><span>${title}</span><div><em>${a==null?'—':a.toFixed(2)}</em><i>→</i><strong>${b==null?'—':b.toFixed(2)}</strong><small>${unit}</small></div><p>${a==null||b==null?say('运行演示后显示','Run the demo to compare'):say('变化 ','Change ')+(b-a>=0?'+':'')+(b-a).toFixed(2)+' '+unit}</p></article>`;
  let html='';
  if(vib){const h=started?r?.harmonic:null,a=h?.reference.amplitude*1000,b=h?.current.amplitude*1000;const ratio=h&&a>1e-9?(1-b/a)*100:null;
   html=card(say('测点振幅','Probe amplitude'),h?a:null,h?b:null,'mm')+`<article class="impact"><span>${say('振幅变化','Amplitude change')}</span><div><strong>${ratio==null?'—':Math.abs(ratio).toFixed(1)}</strong><small>% ${ratio==null?'':say(ratio>=0?'降低':'增加',ratio>=0?'lower':'higher')}</small></div><p>${say('相同力、频率、测点及背景阻尼','Same force, frequency, probe and modal damping')}</p></article>`+`<article><span>${say('阻尼器力幅值','Damper force amplitude')}</span><div><strong>${h?(h.damperForce/1000).toFixed(3):'—'}</strong><small>kN</small></div><p>${h?`c = ${(h.damper.c/1000).toFixed(1)} kN·s/m`:say('加装后查看','Shown after the demo runs')}</p></article>`;
  }else{const a=baselineResult,b=r,force=x=>Math.max(...x.supportForces.map(f=>Math.hypot(...f)))/1000;
   html=card(say('中心线最大总位移','Maximum total movement'),a?a.maxDisplacement*1000:null,b?b.maxDisplacement*1000:null,'mm')+card(say('最大支撑力','Largest support force'),a?force(a):null,b?force(b):null,'kN')+`<article><span>${say('本次工况','Load case')}</span><div><strong>${p.temperature}</strong><small>°C ${say('温升','rise')}</small></div><p>${say('同一管路 · ','Same route · ')+(p.gravity?say('含自重','with gravity'):say('不含自重','without gravity'))}</p></article>`;}
  $('outcome-cards').innerHTML=html;$('outcome-note').textContent=say('显示倍数不影响数值 · 研究模型','Display scale does not change these values · research model');
 }
 async function solved(){const p=api.design(),g=JSON.stringify([p.route,p.diameter,p.wall]);if(g!==geometryKey){geometryKey=g;referenceName='cold';referenceKey='';baselineResult=null;serial++;busy=false;}sync();if(task!=='thermal'||referenceName!=='cold'||!api.result())return;const key=JSON.stringify({...p,temperature:0,excitation:null,damper:null});if(key===referenceKey)return;referenceKey=key;busy=true;sync();const id=++serial;
  try{const cold={...p,temperature:0},r=await api.compute(cold);if(id!==serial)return;baselineResult=r;api.baseline(cold,r);}catch{referenceKey='';baselineResult=null;}finally{if(id===serial){busy=false;sync();}}
 }
 return{sync,solved,restoreBaseline(p,r){serial++;busy=false;geometryKey=JSON.stringify([api.design().route,api.design().diameter,api.design().wall]);baselineResult=r;referenceName=r?'before':'cold';referenceKey='';sync();},beforeEdit(){if(task==='thermal')captureCurrent();},init(){choose('build');},task:()=>task};
}
