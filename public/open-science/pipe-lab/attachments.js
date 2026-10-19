import * as THREE from 'three';
// The foundations stay in world space. Only the pipe collar and connecting hardware move.
export function attachment(group,{origin,tangent,diameter:d,type,axis=2,material,tube,updateTube}){
 const home=new THREE.Vector3(...origin),vertical=new THREE.Vector3(0,0,1),direction=new THREE.Vector3().setComponent(axis,1);
 const anchor=home.clone().addScaledVector(type==='damper'?direction:vertical,-3.8*d);
 if(type==='damper')anchor.x+=axis===0?0:d*1.2,anchor.y+=axis===0?d*1.2:0;
 const add=(geometry,mat=material)=>{const m=new THREE.Mesh(geometry,mat);group.add(m);return m;};
 const foot=add(new THREE.BoxGeometry(d*1.3,d*1.3,d*.16));foot.position.copy(anchor);if(type==='damper')foot.quaternion.setFromUnitVectors(vertical,direction);
 const collar=add(new THREE.TorusGeometry(d*.54,d*.06,8,32));
 const rod=add(new THREE.CylinderGeometry(d*.055,d*.055,1,10));
 const orient=(mesh,a,b)=>{const v=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.y=Math.max(v.length(),1e-7);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());};
 let spring,barrel;
 const slide=type==='spring'||type==='guide'?add(new THREE.CylinderGeometry(d*.035,d*.035,1,8)):null;
 if(type==='spring')spring=add(tube(Array.from({length:65},()=>origin),d*.035));
 if(type==='damper'){
  const mat=new THREE.MeshStandardMaterial({color:0x72d8c6,metalness:.7,roughness:.27});
  barrel=add(new THREE.CylinderGeometry(d*.20,d*.20,d*1.6,16),mat);barrel.userData.ownMaterial=true;
 }
 return (position,localTangent)=>{
  const p=new THREE.Vector3(...position),t=new THREE.Vector3(...(localTangent||tangent)).normalize();collar.position.copy(p);collar.quaternion.setFromUnitVectors(vertical,t);
  const top=p.clone().addScaledVector(type==='damper'?direction:vertical,-d*.52);
  if(type==='spring'){
   const base=anchor.clone();base.x=top.x;base.y=top.y;orient(slide,anchor,base);
   const v=top.clone().sub(base),u=new THREE.Vector3(1,0,0),w=new THREE.Vector3(0,1,0);
   const pts=Array.from({length:65},(_,i)=>{const q=i/64,a=q*Math.PI*12,r=(i===0||i===64)?0:d*.24;return base.clone().addScaledVector(v,q).addScaledVector(u,Math.cos(a)*r).addScaledVector(w,Math.sin(a)*r).toArray();});updateTube(spring.geometry,pts,d*.035);rod.visible=false;
  }else if(type==='damper'){
   // Pin-jointed schematic: rigid barrel, telescoping rod, fixed ground eye.
   const v=top.clone().sub(anchor).normalize();barrel.position.copy(anchor).addScaledVector(v,d*.85);barrel.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v);orient(rod,anchor.clone().addScaledVector(v,d*1.5),top);
  }else if(type==='guide'){
   // A sliding saddle is not a hinged diagonal strut: its column stays vertical.
   const base=anchor.clone();base.x=p.x;base.y=p.y;orient(slide,anchor,base);orient(rod,base,top);
  }else orient(rod,anchor,top);
 };
}
