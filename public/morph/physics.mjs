// Apache-2.0. Browser implementation of src/rod.py, same 48 angle elements.
export const N=48;
export const base={chi:.001,fx:.0003,fy:-.0001,moment:0,h:0,delta:.1,k1:0,k2:0,k3:0};
const norm=v=>Math.sqrt(v.reduce((s,x)=>s+x*x,0));
export function terms(z,c){
 const g=Array(N).fill(0),d=Array(N).fill(0),e=Array(N-1).fill(0);let energy=0;
 for(let i=0;i<N;i++){
  const l=i?z[i-1]:0,r=z[i],a=(l+r)/2,k=[c.k1,c.k2,c.k3][Math.floor(i/16)],bend=(r-l)*N-k;
  const f=(c.fx+2*c.h)*Math.cos(a)+c.fy*Math.sin(a),fp=-(c.fx+2*c.h)*Math.sin(a)+c.fy*Math.cos(a),G=4*c.h*c.delta;
  const v=(-(1+f)*fp-G*Math.sin(a))/(2*N),hh=((1+f)*f-fp*fp-G*Math.cos(a))/(4*N),b=c.chi*bend;
  energy+=(.5*c.chi*bend*bend-f-.5*f*f+G*Math.cos(a))/N;
  g[i]+=b+v;d[i]+=c.chi*N+hh;
  if(i){g[i-1]+=-b+v;d[i-1]+=c.chi*N+hh;e[i-1]+=-c.chi*N+hh;}
 }
 g[N-1]-=c.moment;energy-=c.moment*z[N-1];return {g,d,e,energy};
}
function tri(d,e,b){
 d=d.slice();b=b.slice();
 for(let i=1;i<d.length;i++){if(Math.abs(d[i-1])<1e-16)throw Error('singular');const f=e[i-1]/d[i-1];d[i]-=f*e[i-1];b[i]-=f*b[i-1];}
 const x=Array(d.length);for(let i=d.length-1;i>=0;i--){if(Math.abs(d[i])<1e-16)throw Error('singular');x[i]=(b[i]-(i+1<d.length?e[i]*x[i+1]:0))/d[i];}return x;
}
function eigen(d,e){
 const count=lambda=>{let neg=0,p=0;for(let i=0;i<N;i++){let q=d[i]-lambda*(i===N-1?1:2)/(4*N);if(i){const off=e[i-1]-lambda/(4*N);q-=off*off/p;}p=Math.abs(q)<1e-18?-1e-18:q;if(p<0)neg++;}return neg;};
 let lo=-1,hi=1;for(let i=0;i<40&&count(lo)>0;i++)lo*=2;for(let i=0;i<40&&count(hi)===0;i++)hi*=2;
 for(let i=0;i<65;i++){const m=(lo+hi)/2;if(count(m))hi=m;else lo=m;}return (lo+hi)/2;
}
export function solve(c,seed=null,stability=true){
 let z=seed?seed.slice():Array(N).fill(0),it=0;
 for(;it<60;it++){
  const t=terms(z,c),old=norm(t.g);if(Math.max(...t.g.map(Math.abs))<1e-10)break;
  let dz;try{dz=tri(t.d,t.e,t.g.map(x=>-x));}catch{break;}
  let alpha=1,trial,accepted=false;
  for(let j=0;j<16;j++){trial=z.map((v,i)=>v+alpha*dz[i]);if(norm(terms(trial,c).g)<old){accepted=true;break;}alpha*=.5;}
  if(!accepted)break;z=trial;
 }
 const t=terms(z,c),residual=Math.max(...t.g.map(Math.abs)),xy=[[0,0]],angles=[],strains=[];
 for(let i=0;i<N;i++){const a=((i?z[i-1]:0)+z[i])/2,eps=(c.fx+2*c.h)*Math.cos(a)+c.fy*Math.sin(a);angles.push(a);strains.push(eps);xy.push([xy[i][0]+(1+eps)*Math.cos(a)/N,xy[i][1]+(1+eps)*Math.sin(a)/N]);}
 const good=residual<1e-9&&Math.min(...strains)+1>(c.h?2*c.delta:0)&&z.every(Number.isFinite);
 const eig=good&&stability?eigen(t.d,t.e)/c.chi:null;
 return {z,xy,tip:xy[N],residual,accepted:good,lambda:eig,stability:eig===null?'unknown':eig>1e-4?'stable':eig< -1e-4?'unstable':'critical',energy:t.energy,iterations:it};
}
export function forward(k,stability=true){
 const c={...base,k1:k[0],k2:k[1],k3:k[2]};let angle=0;
 const seed=Array.from({length:N},(_,i)=>angle+=k[Math.floor(i/16)]/N);
 return solve(c,seed,stability);
}
export function resample(points,count=49){
 const s=[0];for(let i=1;i<points.length;i++)s.push(s[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
 if(s.at(-1)<1e-8)return Array.from({length:count},()=>points[0].slice());
 let j=1;return Array.from({length:count},(_,i)=>{const t=s.at(-1)*i/(count-1);while(j<s.length-1&&s[j]<t)j++;const a=(t-s[j-1])/(s[j]-s[j-1]||1);return points[j-1].map((v,k)=>v+a*(points[j][k]-v));});
}
function dense3(A,b){
 A=A.map((r,i)=>[...r,b[i]]);
 for(let i=0;i<3;i++){let p=i;for(let j=i+1;j<3;j++)if(Math.abs(A[j][i])>Math.abs(A[p][i]))p=j;[A[i],A[p]]=[A[p],A[i]];if(Math.abs(A[i][i])<1e-15)return [0,0,0];for(let j=i+1;j<3;j++){const t=A[j][i]/A[i][i];for(let k=i;k<4;k++)A[j][k]-=t*A[i][k];}}
 const x=[0,0,0];for(let i=2;i>=0;i--){x[i]=A[i][3];for(let j=i+1;j<3;j++)x[i]-=A[i][j]*x[j];x[i]/=A[i][i];}return x;
}
export function design(target,shape=false,warm=null){
 const residual=k=>{const s=forward(k,false);if(!s.accepted)throw Error('No equilibrium');const a=shape?s.xy.flatMap((p,i)=>p.map((v,j)=>v-target[i][j])):s.tip.map((v,i)=>v-target[i]);return [...a.map(x=>20*x),...k.map(x=>.002*x)];};
 let best=null;
 for(const initial of [warm||[0,0,0],[-1.2,-1.2,-1.2],[1.2,1.2,1.2]]){
  let k=initial.slice(),r=residual(k),cost=norm(r)**2,mu=.001;
  for(let iter=0;iter<45;iter++){
   const jac=[0,1,2].map(j=>{const kk=k.slice();kk[j]+=1e-4;const rr=residual(kk);return rr.map((v,i)=>(v-r[i])/1e-4);});
   const A=jac.map((col,i)=>jac.map((other,j)=>col.reduce((s,x,a)=>s+x*other[a],0)+(i===j?mu:0)));
   const b=jac.map(col=>-col.reduce((s,x,i)=>s+x*r[i],0)),delta=dense3(A,b);
   const trial=k.map((v,i)=>Math.max(-2.4,Math.min(2.4,v+delta[i]))),rr=residual(trial),next=norm(rr)**2;
   if(next<cost){const change=cost-next;k=trial;r=rr;cost=next;mu=Math.max(1e-7,mu*.4);if(change<1e-12)break;}else mu*=8;
   if(mu>1e8)break;
  }
  if(!best||cost<best.cost)best={k,cost};
 }
 const state=forward(best.k),error=shape?Math.sqrt(state.xy.reduce((s,p,i)=>s+(p[0]-target[i][0])**2+(p[1]-target[i][1])**2,0)/49):Math.hypot(state.tip[0]-target[0],state.tip[1]-target[1]);
 return {k:best.k,state,error,matched:error<.005&&state.accepted};
}
export function branches(p){
 const c={...base,chi:.0001,h:.01,delta:.1,fx:p,fy:0};const output={};
 for(const [name,sign] of [['down',-1],['straight',0],['up',1]]){
  let s=solve(c);if(sign)for(const amp of [1.2,.6,2,2.8,3.2]){s=solve(c,Array.from({length:N},(_,i)=>sign*amp*Math.sin(Math.PI*(i+1)/(2*N))));if(s.accepted&&s.tip[1]*sign>.001)break;}
  if(!s.accepted||(sign&&s.tip[1]*sign<=.001))throw Error('Requested branch not found');output[name]=s;
 }return output;
}
