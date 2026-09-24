/* Animate the 241 recorded loading increments, not an invented curve. */
(() => {
  const host=document.querySelector('.art-secondary picture');
  const image=host.querySelector('img');
  let svg, traces=[],wanted=false,loading=false,frame=0,last=0,elapsed=0;
  const NS='http://www.w3.org/2000/svg',duration=10000;
  function paint(){
    const progress=Math.min(1,elapsed/8500),fade=elapsed>9400?(10000-elapsed)/600:1;
    for(const trace of traces){
      const u=progress*(trace.points.length-1),i=Math.min(Math.floor(u),trace.points.length-2),f=u-i;
      const a=trace.points[i],b=trace.points[i+1],length=trace.lengths[i]+f*(trace.lengths[i+1]-trace.lengths[i]);
      trace.line.setAttribute('stroke-dasharray',length+' '+(trace.total+1));
      trace.line.setAttribute('opacity',fade);
      trace.dot.setAttribute('cx',a[0]+f*(b[0]-a[0]));
      trace.dot.setAttribute('cy',a[1]+f*(b[1]-a[1]));
      trace.dot.setAttribute('opacity',fade);
    }
  }
  function tick(now){
    frame=0;
    if(!wanted||document.hidden)return;
    if(last)elapsed+=Math.min(now-last,100);
    last=now;
    if(elapsed>=duration)elapsed%=duration;
    paint();frame=requestAnimationFrame(tick);
  }
  function sync(){
    if(wanted&&!document.hidden&&svg){if(!frame){last=0;frame=requestAnimationFrame(tick);}}
    else{cancelAnimationFrame(frame);frame=0;last=0;}
  }
  async function load(){
    if(svg||loading)return;
    loading=true;
    try{
      const response=await fetch(image.dataset.src);
      if(!response.ok)throw new Error('Curve asset unavailable');
      const doc=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
      const root=doc.documentElement;
      if(root.localName!=='svg')throw new Error('Invalid curve asset');
      const lines=[...root.querySelectorAll('path[stroke="#b1ddd9"],path[stroke="#e7ad78"]')];
      if(lines.length!==2)throw new Error('Missing response curves');
      root.removeAttribute('width');root.removeAttribute('height');
      root.classList.add('memory-live');root.setAttribute('aria-hidden','true');
      for(const source of lines){
        const numbers=source.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number),points=[];
        for(let i=0;i<numbers.length;i+=2)points.push([numbers[i],numbers[i+1]]);
        const lengths=[0];
        for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
        source.setAttribute('opacity','.14');
        const line=source.cloneNode(true);
        line.removeAttribute('stroke-dasharray');line.setAttribute('stroke-linecap','round');
        line.setAttribute('stroke-width',source.getAttribute('stroke')==='#b1ddd9'?'3.5':'2');
        root.append(line);
        const dot=document.createElementNS(NS,'circle');
        dot.setAttribute('r',source.getAttribute('stroke')==='#b1ddd9'?'5':'3');
        dot.setAttribute('fill',source.getAttribute('stroke'));root.append(dot);
        traces.push({line,dot,points,lengths,total:lengths[lengths.length-1]});
      }
      svg=document.importNode(root,true);
      // importNode copies the tree: keep the animation handles on the live nodes.
      traces.forEach((trace,i)=>{trace.line=svg.children[svg.children.length-4+i*2];trace.dot=svg.children[svg.children.length-3+i*2];});
      host.append(svg);image.style.visibility='hidden';paint();sync();
    }catch{loading=false;/* Keep the original static plot as the fallback. */}
  }
  window.MemoryMotion={setPlaying(value){wanted=Boolean(value);if(wanted)load();sync();}};
  document.addEventListener('visibilitychange',sync);
})();
