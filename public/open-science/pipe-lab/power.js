// Section geometry and constants are mirrored from the generated catalog,
// rather than pretending the four services are merely display labels.
export function setupPower({families,getLanguage,getDesign,applyDesign}){
 const el=document.createElement('section');el.className='power-picker';
 el.innerHTML='<label class="field"><span id="service-label"></span><select id="service"></select></label><p id="section-basis" class="hint"></p>';
 document.getElementById('tools').prepend(el);
 const $=id=>document.getElementById(id),zh=()=>getLanguage()==='zh';
 function family(){const p=getDesign();return families.find(f=>Math.abs(f.diameter-p.diameter)<1e-9&&Math.abs(f.thickness/f.diameter-p.wall)<1e-9);}
 function sync(){
  const f=family();$('service-label').textContent=zh()?'管道类型':'Pipe service';
  $('service').replaceChildren(new Option(zh()?'通用管道':'Generic pipe','generic'),...families.map(f=>new Option(f[zh()?'zh':'en'],f.id)));$('service').value=f?.id||'generic';
  $('diameter').disabled=$('wall').disabled=!!f;
  $('diameter').replaceChildren(...(f?[f.diameter]:[.12,.16,.2,.24]).map(d=>new Option(`${d*1000} mm`,d)));$('diameter').value=getDesign().diameter;
  $('wall').replaceChildren(...(f?[f.thickness/f.diameter]:[.04,.06]).map(w=>new Option(`${+(getDesign().diameter*w*1000).toFixed(1)} mm`,w)));$('wall').value=getDesign().wall;
  $('temperature').max=f?600:200;$('temperature').step=1;
  $('section-basis').textContent=f?(zh()?`研究截面 · ${f.diameter*1000} × ${f.thickness*1000} mm`:`Research section · ${f.diameter*1000} × ${f.thickness*1000} mm`):'';
  document.querySelector('[data-t="material"]').textContent=f?`E ${f.young/1e9} GPa · α ${+(f.alpha*1e6).toFixed(1)} × 10⁻⁶/K · ${zh()?'常系数研究模型':'constant-property benchmark'}`:zh()?'钢 · E 200 GPa · α 12 × 10⁻⁶/K':'Steel · E 200 GPa · α 12 × 10⁻⁶/K';
  const scope=$('scope-note');if(scope)scope.textContent=zh()?'四大管道 · 代表性管段':'Power piping · representative segments';
 }
 function select(id){
  const f=families.find(f=>f.id===id),p=getDesign();
  p.diameter=f?.diameter||.2;p.wall=f?f.thickness/f.diameter:.06;p.temperature=f?.temperature||100;
  p.route=[{kind:'straight',ratio:8,roll:0},{kind:'elbow',ratio:3,roll:0},{kind:'straight',ratio:8,roll:0},{kind:'elbow',ratio:3,roll:90},{kind:'straight',ratio:5,roll:0}];
  p.supports={3:{type:'spring',k:100000},5:{type:'spring',k:100000}};
  p.damper={node:5,axis:2,c:10000};p.excitation={node:5,axis:2,force:1000,frequency:10,zeta:.02};
  // Set the range before applying a saved temperature (HTML ranges clamp values).
  $('temperature').max=f?600:200;$('scale').value=f?'10':'30';applyDesign(p);sync();
 };
 $('service').onchange=()=>select($('service').value);
 return {sync,family,select};
}
