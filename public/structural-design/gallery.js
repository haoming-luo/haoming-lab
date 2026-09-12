/* Curated official references; independent of simulation and model state.
 * Images are loaded from their publishers only when the gallery is opened.
 * This catalogue can be extended without modifying the viewer or inference.
 */
(() => {
  const cases = [
    {title:'火箭管路支架', name:'阿丽亚娜火箭 · 钛合金支架', tag:'01 / 航天 · 拓扑优化',
      text:'拓扑优化与钛合金增材制造，使管路支架减重 30%。',
      credit:'ESA–A. Abel · ArianeGroup, 2019',
      source:'https://www.esa.int/ESA_Multimedia/Images/2019/06/Metal_3D-printed_Ariane_launcher_bracket',
      image:'https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2019/06/metal_3d-printed_ariane_launcher_bracket/19447961-1-eng-GB/Metal_3D-printed_Ariane_launcher_bracket_pillars.jpg'},
    {title:'飞机仿生隔板', name:'Airbus · 仿生客舱隔板', tag:'02 / 航空 · 仿生设计',
      text:'以分支承力网络替代传统隔板，减少结构用料。',
      credit:'Airbus / Autodesk · Bionic Partition, 2019',
      source:'https://adsknews.autodesk.com/en/news/autodesk-airbus-generative-design-aerospace-factory/',
      image:'https://adsknews.autodesk.com/app/uploads/2019/11/image87-1024x684.jpg'},
    {title:'望远镜支撑结构', name:'NASA · EXCITE 望远镜支撑', tag:'03 / 科学仪器 · 生成式设计',
      text:'针对偏心载荷生成交错支撑，兼顾轻量化与结构刚度。',
      credit:'NASA / Henry Dennis · Evolved Structures, 2023',
      source:'https://www.nasa.gov/technology/nasa-turns-to-ai-to-design-mission-hardware/',
      image:'https://www.nasa.gov/wp-content/uploads/2023/02/excite.jpg?w=1200'},
    {title:'轻量化晶格支架', name:'nTop · NASA EXCITE A15 基准设计', tag:'04 / 航空航天 · 晶格优化',
      text:'联合优化外壳与内部晶格厚度，兼顾低质量与抗振性能。',
      credit:'nTop · EXCITE A15 Field Optimization, 2023',
      source:'https://www.ntop.com/resources/blog/optimizing-the-mass-and-natural-frequency-of-the-nasa-excite-bracket-with-field-optimization/',
      image:'https://cdn.sanity.io/images/g5181r9i/production/e20834481020cbc8008f5a12ae403b80d8f3cb52-1920x1080.jpg?q=80&fit=clip&auto=format&w=1200'},
    {title:'钛合金制动卡钳', name:'Bugatti · 3D 打印钛合金制动卡钳', tag:'05 / 汽车 · 增材制造',
      text:'以复杂薄壁结构减轻高载荷制动零件的重量。',
      credit:'Bugatti / Laser Zentrum Nord, 2018',
      source:'https://newsroom.bugatti.com/en/press-releases/world-premiere-brake-caliper-from-3-d-printer',
      image:'https://bugatti-newsroom.imgix.net/dc022e66ec34495d87e10e2cf36754ff/180122_bugatti-3d-druck_bild1.jpg?auto=format,compress&cs=srgb&w=1200'},
    {title:'飞机尾翼前缘', name:'Airbus · 垂直尾翼前缘概念', tag:'06 / 航空 · 生成式设计',
      text:'按刚度、稳定性与质量要求探索数百种方案。图为打印模型。',
      credit:'Airbus / Autodesk · Vertical Tail Plane, 2019',
      source:'https://adsknews.autodesk.com/en/news/autodesk-airbus-generative-design-aerospace-factory/',
      image:'https://adsknews.autodesk.com/app/uploads/2019/11/P1080386-1024x683.jpg'}
  ];
  const entry=document.createElement('button');entry.id='open-gallery';entry.type='button';
  entry.innerHTML='<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="2" y="3" width="11" height="14" rx="1"/><path d="M16 5v10M5 12l3-4 3 4"/></svg><span>结构设计灵感</span><span aria-hidden="true">↗</span>';
  entry.setAttribute('aria-haspopup','dialog');document.body.append(entry);
  const gallery=document.createElement('dialog');gallery.id='structure-gallery';gallery.setAttribute('aria-labelledby','gallery-title');
  gallery.innerHTML=`<div class="gallery-top"><div><small>STRUCTURAL DESIGN GALLERY</small><h2 id="gallery-title">先进结构设计案例</h2></div><button class="gallery-close" aria-label="关闭结构设计灵感" title="关闭"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>
    <div class="gallery-feature"><div class="gallery-picture"><img id="gallery-image" alt=""><div class="gallery-loading" role="status">正在载入案例图片…</div></div><div class="gallery-copy" aria-live="polite"><small id="gallery-tag"></small><h3 id="gallery-heading"></h3><p id="gallery-description"></p><div class="gallery-source"><span id="gallery-name"></span><a id="gallery-credit" target="_blank" rel="noopener noreferrer"></a></div></div></div>
    <div class="gallery-thumbs" role="group" aria-label="选择结构案例"></div><div class="gallery-bottom">航天 / 航空 / 汽车 <span>点击缩略图 · ← → 切换</span></div>`;
  document.body.append(gallery);
  const q=s=>gallery.querySelector(s),photo=q('#gallery-image'),loading=q('.gallery-loading');let selected=0,initialized=false;
  function show(index){selected=(index+cases.length)%cases.length;const c=cases[selected];
    q('#gallery-tag').textContent=c.tag;q('#gallery-heading').textContent=c.title;q('#gallery-description').textContent=c.text;
    q('#gallery-name').textContent=c.name;q('#gallery-credit').textContent=c.credit+' ↗';q('#gallery-credit').href=c.source;
    loading.hidden=false;loading.textContent='正在载入案例图片…';photo.style.opacity='0';photo.alt=c.name;photo.src=c.image;
    for(const [i,b] of [...q('.gallery-thumbs').children].entries()){b.setAttribute('aria-pressed',String(i===selected));}
  }
  photo.onload=()=>{photo.style.opacity='1';loading.hidden=true;};
  photo.onerror=()=>{loading.textContent='图片暂未载入，请联网重试，或点击右侧来源查看。';};
  function open(){if(!initialized){cases.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='gallery-thumb';b.setAttribute('aria-label',c.name);b.innerHTML=`<img src="${c.image}" alt="" loading="lazy"><span><small>${String(i+1).padStart(2,'0')}</small>${c.title}</span>`;b.onclick=()=>show(i);q('.gallery-thumbs').append(b);});initialized=true;}gallery.showModal();show(selected);}
  entry.onclick=open;q('.gallery-close').onclick=()=>gallery.close();
  gallery.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(selected+(e.key==='ArrowRight'?1:-1));}});
  gallery.addEventListener('click',e=>{if(e.target===gallery){const r=gallery.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)gallery.close();}});
  gallery.addEventListener('close',()=>entry.focus());
})();
