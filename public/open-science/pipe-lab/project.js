/* Versioned, portable project contract. No executable content in imports. */
export const VERSION='1.3.0';
export const POWER_SECTIONS=[[.45,.06/.45],[.8,.03/.8],[.8,.02/.8],[.45,.05/.45]];
export const isPowerSection=p=>POWER_SECTIONS.some(([d,w])=>Math.abs(p.diameter-d)<1e-9&&Math.abs(p.wall-w)<1e-9);
export function validateProject(raw){
  if(!raw||raw.schema!=='agentfem.pipe-project/1'||!['1.1.0','1.2.0',VERSION].includes(raw.modelVersion)||raw.units!=='SI')throw Error('VERSION');
  const p=raw.design;
  if(!p||(!isPowerSection(p)&&(![.12,.16,.2,.24].includes(p.diameter)||![.04,.06].includes(p.wall)))||!Array.isArray(p.route)||!p.route.length||p.route.length>10)throw Error('GEOMETRY');
  const route=p.route.map(r=>{
    if(!r||!['straight','elbow'].includes(r.kind)||!(r.kind==='straight'?[3,5,8]:[1.5,2,3]).includes(r.ratio)||![0,90,180,270].includes(r.roll))throw Error('COMPONENT');
    return {kind:r.kind,ratio:r.ratio,roll:r.roll};
  });
  if(!Number.isFinite(p.temperature)||p.temperature<0||p.temperature>(isPowerSection(p)?600:200)||typeof p.gravity!=='boolean')throw Error('LOAD');
  const supports={};
  for(const [key,s] of Object.entries(p.supports||{})){
    const node=Number(key);if(!Number.isInteger(node)||node<1||node>route.length||!s||!['none','spring','guide','fixed'].includes(s.type)||!Number.isFinite(s.k)||s.k<10000||s.k>1000000)throw Error('SUPPORT');
    supports[node]={type:s.type,k:s.k};
  }
  const d=p.damper;
  if(!d||!Number.isInteger(d.node)||d.node<1||d.node>route.length||![0,1,2].includes(d.axis)||!Number.isFinite(d.c)||d.c<0||d.c>100000)throw Error('DAMPER');
  const h=p.excitation||{node:route.length,axis:2,force:100,frequency:10,zeta:.02};
  if(!Number.isInteger(h.node)||h.node<1||h.node>route.length||![0,1,2].includes(h.axis)||!(h.force>0&&h.force<=10000)||!(h.frequency>0&&h.frequency<=2000)||!(h.zeta>=.001&&h.zeta<=.1))throw Error('EXCITATION');
  return {route,diameter:p.diameter,wall:p.wall,supports,temperature:p.temperature,gravity:p.gravity,damper:{node:d.node,axis:d.axis,c:d.c},excitation:{node:h.node,axis:h.axis,force:h.force,frequency:h.frequency,zeta:h.zeta}};
}
export function removeComponent(p,index){
  const next=structuredClone(p);if(next.route.length<=1)return next;
  next.route.splice(index,1);next.supports={};
  // Remove the deleted segment's downstream joint; keep upstream attachments.
  for(const [key,s] of Object.entries(p.supports)){const n=+key;if(n===index+1)continue;next.supports[n>index+1?n-1:n]=s;}
  if(next.damper.node===index+1)next.damper.c=0;
  next.damper.node=Math.max(1,Math.min(next.route.length,next.damper.node>index+1?next.damper.node-1:next.damper.node));
  if(next.excitation)next.excitation.node=Math.max(1,Math.min(next.route.length,next.excitation.node>index+1?next.excitation.node-1:next.excitation.node));
  return next;
}
