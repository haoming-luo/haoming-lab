/* Apache-2.0. Reference browser assembler for solid-derived component ROMs. */
(function(root){
  const lib=typeof require==='function'?require('./vendor/matrix.umd.js'):root.mlMatrix;
  const {Matrix,CholeskyDecomposition,EigenvalueDecomposition}=lib;
  const zeros=(n,m=n)=>Array.from({length:n},()=>Array(m).fill(0));
  const eye=n=>zeros(n).map((r,i)=>(r[i]=1,r));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const mul=(A,B)=>{let C=zeros(A.length,B[0].length);for(let i=0;i<A.length;i++)for(let k=0;k<B.length;k++){let v=A[i][k];if(v!==0)for(let j=0;j<B[0].length;j++)C[i][j]+=v*B[k][j];}return C;};
  const mv=(A,v)=>A.map(r=>r.reduce((s,x,j)=>s+x*v[j],0));
  const add=(a,b)=>a.map((v,i)=>v+b[i]);
  const rx=a=>[[1,0,0],[0,Math.cos(a),-Math.sin(a)],[0,Math.sin(a),Math.cos(a)]];
  const rz=a=>[[Math.cos(a),-Math.sin(a),0],[Math.sin(a),Math.cos(a),0],[0,0,1]];
  const block=(R,n)=>{const D=zeros(3*n);for(let k=0;k<n;k++)for(let i=0;i<3;i++)for(let j=0;j<3;j++)D[3*k+i][3*k+j]=R[i][j];return D;};
  const sub=(A,ix)=>ix.map(i=>ix.map(j=>A[i][j]));
  const sym=A=>A.map((r,i)=>r.map((v,j)=>(v+A[j][i])/2));
  const norm=v=>Math.hypot(...v);
  function linear(K,F){
    const d=K.map((r,i)=>1/Math.sqrt(Math.max(r[i],1e-30)));
    const A=new Matrix(sym(K.map((r,i)=>r.map((v,j)=>v*d[i]*d[j]))));
    const c=new CholeskyDecomposition(A);
    if(!c.isPositiveDefinite())throw Error('UNRESTRAINED');
    const q=c.solve(Matrix.columnVector(F.map((v,i)=>v*d[i]))).to1DArray();
    return q.map((v,i)=>v*d[i]);
  }
  function modes(K,M,count=3){
    // Scale mixed physical/normal coordinates before whitening the mass.
    let d=M.map((r,i)=>1/Math.sqrt(r[i]));
    const ms=M.map((r,i)=>r.map((v,j)=>v*d[i]*d[j]));
    const ks=K.map((r,i)=>r.map((v,j)=>v*d[i]*d[j]));
    const C=new CholeskyDecomposition(new Matrix(sym(ms)));
    if(!C.isPositiveDefinite())throw Error('MASS');
    const L=C.lowerTriangularMatrix.to2DArray(),n=L.length,inv=zeros(n);
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){let v=i===j?1:0;for(let k=0;k<i;k++)v-=L[i][k]*inv[k][j];inv[i][j]=v/L[i][i];}
    const A=sym(mul(mul(inv,ks),tr(inv)));
    const e=new EigenvalueDecomposition(new Matrix(A),{assumeSymmetric:true});
    const vals=e.realEigenvalues,vectors=e.eigenvectorMatrix.to2DArray();
    let order=vals.map((v,i)=>i).sort((a,b)=>vals[a]-vals[b]);
    if(vals[order[0]]<=0)throw Error('UNRESTRAINED');
    order=order.slice(0,count);
    const V=mul(tr(inv),vectors.map(r=>order.map(j=>r[j]))).map((r,i)=>r.map(v=>v*d[i]));
    return {frequency:order.map(j=>Math.sqrt(vals[j])/(2*Math.PI)),vectors:V};
  }
  function solve(request){
    const start=typeof performance==='undefined'?Date.now():performance.now();
    const {components,rolls=[],supports=[],deltaT=100,gravity=[0,0,-9.81]}=request;
    const n=components.length,nq=6*(n+1),nm=components.map(c=>c.Kr.length-12),nc=nq+nm.reduce((a,b)=>a+b,0);
    let K=zeros(nq),KC=zeros(nc),MC=zeros(nc),F=Array(nq).fill(0),places=[],origin=[0,0,0],R=eye(3),offset=nq;
    const accumulate=(A,B,ix)=>{for(let i=0;i<ix.length;i++)for(let j=0;j<ix.length;j++)A[ix[i]][ix[j]]+=B[i][j];};
    for(let a=0;a<n;a++){
      let c=components[a];R=mul(R,rx(rolls[a]||0));let D=block(tr(R),4),ix=Array.from({length:12},(_,j)=>6*a+j);
      accumulate(K,mul(mul(tr(D),c.S),D),ix);
      const fg=mv(c.g,mv(tr(R),gravity)),fl=mv(tr(D),fg.map((v,j)=>v+c.fT[j]*deltaT));
      ix.forEach((id,j)=>F[id]+=fl[j]);
      let Dc=eye(12+nm[a]);for(let i=0;i<12;i++)for(let j=0;j<12;j++)Dc[i][j]=D[i][j];
      let ic=ix.concat(Array.from({length:nm[a]},(_,j)=>offset+j));
      accumulate(KC,mul(mul(tr(Dc),c.Kr),Dc),ic);accumulate(MC,mul(mul(tr(Dc),c.Mr),Dc),ic);
      places.push({origin:[...origin],rotation:R.map(r=>[...r]),D,Dc,ix,ic});
      origin=add(origin,mv(R,c.ports[1]));if(c.spec.kind==='elbow')R=mul(R,rz(Math.PI/2));offset+=nm[a];
    }
    const fixed=new Set();let spring=Array(nq).fill(0);
    supports.forEach(s=>{(s.fixed||[]).forEach(j=>fixed.add(6*s.node+j));(s.spring||[]).forEach((v,j)=>{let i=6*s.node+j;K[i][i]+=v;KC[i][i]+=v;spring[i]+=v;});});
    let free=Array.from({length:nq},(_,i)=>i).filter(i=>!fixed.has(i)),q=Array(nq).fill(0);
    const sol=linear(sym(sub(K,free)),free.map(i=>F[i]));free.forEach((v,i)=>q[v]=sol[i]);
    let reaction=mv(K,q).map((v,i)=>v-F[i]);
    let residual=norm(free.map(i=>reaction[i]))/Math.max(1,norm(F));
    const fC=Array.from({length:nc},(_,i)=>i).filter(i=>!fixed.has(i));
    const count=(request.dynamic||request.harmonic)?Math.min((request.dynamic||request.harmonic).modeCount||12,fC.length):3;
    const eig=modes(sub(KC,fC),sub(MC,fC),count),V=zeros(nc,count);fC.forEach((v,i)=>V[v]=eig.vectors[i]);
    let paths=[],displacements=[],modeDisplacements=[],nodes=[],mass=0;
    for(let a=0;a<n;a++){
      const c=components[a],p=places[a],local=mv(p.D,p.ix.map(j=>q[j])),gg=mv(tr(p.rotation),gravity),lm=mul(p.Dc,p.ic.map(j=>V[j]));
      paths.push(c.path.map(x=>add(p.origin,mv(p.rotation,x))));nodes.push(paths[a][0]);
      displacements.push(c.path.map((_,j)=>mv(p.rotation,add(add(mv(c.recovery[j],local),c.thermal_recovery[j].map(v=>v*deltaT)),mv(c.gravity_recovery[j],gg)))));
      modeDisplacements.push(c.path.map((_,j)=>mul(p.rotation,mul(c.recovery[j].map((r,k)=>r.concat(c.mode_recovery[j][k])),lm))));
      mass+=c.metrics.mass_kg;
    }
    nodes.push(paths[n-1].at(-1));
    let maxDisplacement=0,maxLocation={component:0,sample:0,position:paths[0][0]};
    displacements.forEach((p,a)=>p.forEach((u,j)=>{if(norm(u)>maxDisplacement){maxDisplacement=norm(u);maxLocation={component:a,sample:j,position:paths[a][j]};}}));
    let supportForces=supports.map(s=>Array.from({length:3},(_,j)=>fixed.has(6*s.node+j)?reaction[6*s.node+j]:-spring[6*s.node+j]*q[6*s.node+j]));
    if(!Number.isFinite(maxDisplacement)||residual>1e-6)throw Error('RESIDUAL');
    let dynamics=null;
    if(request.dynamic){
      const d=request.dynamic,node=d.node??n,axis=d.axis??2,c=d.c??10000;
      if(!Number.isInteger(node)||node<0||node>n||![0,1,2].includes(axis)||!Number.isFinite(c)||c<0)throw Error('DAMPER');
      let peak=0,probe=null;
      modeDisplacements.forEach((path,a)=>path.forEach((m,j)=>m.forEach((r,k)=>{if(Math.abs(r[0])>peak){peak=Math.abs(r[0]);probe={component:a,sample:j,axis:k};}})));
      const amplitude=d.amplitude??.001;
      if(!(amplitude>0&&amplitude<=.01))throw Error('AMPLITUDE');
      const z0=Array(count).fill(0);z0[0]=amplitude/modeDisplacements[probe.component][probe.sample][probe.axis][0];
      const b=V[node*6+axis],C=b.map(x=>b.map(y=>c*x*y)),omega=eig.frequency.map(f=>2*Math.PI*f);
      dynamics=decay(omega,C,z0,d.duration??6/eig.frequency[0],d.stepFactor||1);
      const probeVector=modeDisplacements[probe.component][probe.sample][probe.axis];
      dynamics.signal=dynamics.coordinates.map(z=>z.reduce((s,v,i)=>s+v*probeVector[i],0));
      dynamics.reference=dynamics.time.map(t=>z0[0]*probeVector[0]*Math.cos(omega[0]*t));
      dynamics.force=dynamics.velocities.map(v=>-c*v.reduce((s,x,i)=>s+x*b[i],0));
      dynamics.peakForce=Math.max(...dynamics.force.map(Math.abs));
      Object.assign(dynamics,{node,axis,c,probe,amplitude,modeCount:count,frequency:eig.frequency,blocked:fixed.has(node*6+axis)});
      delete dynamics.velocities;
    }
    const harmonic=request.harmonic?frequencyResponse(eig.frequency,V,modeDisplacements,request.harmonic,n,fixed):null;
    return {q,reaction,paths,nodes,displacements,modeDisplacements,frequency:eig.frequency.slice(0,3),mass,maxDisplacement,maxLocation,supportForces,supportNodes:supports.map(s=>s.node),residual,dynamics,harmonic,
      elapsedMs:(typeof performance==='undefined'?Date.now():performance.now())-start};
  }
  // Average-acceleration Newmark, mass-normalized modal coordinates.
  // Physical non-proportional damping C=c*b*b^T is kept in full.
  function decay(omega,C,z0,duration,stepFactor=1){
    const n=omega.length,frames=600,stride=Math.ceil(Math.max(2400,80*Math.max(...omega)/(2*Math.PI)*duration)*stepFactor/frames),steps=stride*frames;
    if(steps>240000||!(duration>0)||!Number.isFinite(duration))throw Error('DYNAMIC_RANGE');
    const h=duration/steps,w2=omega.map(w=>w*w),H=C.map((r,i)=>r.map((v,j)=>h*.5*v+(i===j?1+h*h*.25*w2[i]:0)));
    const factor=new CholeskyDecomposition(new Matrix(sym(H))).lowerTriangularMatrix.to2DArray();
    const solveH=rhs=>{const y=Array(n),x=Array(n);for(let i=0;i<n;i++){let s=rhs[i];for(let j=0;j<i;j++)s-=factor[i][j]*y[j];y[i]=s/factor[i][i];}for(let i=n-1;i>=0;i--){let s=y[i];for(let j=i+1;j<n;j++)s-=factor[j][i]*x[j];x[i]=s/factor[i][i];}return x;};
    let z=[...z0],v=Array(n).fill(0),a=z.map((x,i)=>-w2[i]*x),diss=0,peakEnergyRise=0;
    const energy=()=>z.reduce((s,x,i)=>s+.5*(v[i]*v[i]+w2[i]*x*x),0),E0=energy();
    const time=[],coordinates=[],velocities=[],energies=[],dissipated=[];
    const record=t=>{time.push(t);coordinates.push([...z]);velocities.push([...v]);energies.push(energy());dissipated.push(diss);};record(0);
    for(let step=1;step<=steps;step++){
      const zp=z.map((x,i)=>x+h*v[i]+h*h*.25*a[i]),vp=v.map((x,i)=>x+h*.5*a[i]);
      const an=solveH(mv(C,vp).map((x,i)=>-x-w2[i]*zp[i]));
      const vn=vp.map((x,i)=>x+h*.5*an[i]),mid=v.map((x,i)=>(x+vn[i])*.5),prior=energy();
      const cmid=mv(C,mid);diss+=h*mid.reduce((s,x,i)=>s+x*cmid[i],0);
      z=zp.map((x,i)=>x+h*h*.25*an[i]);v=vn;a=an;
      peakEnergyRise=Math.max(peakEnergyRise,(energy()-prior)/Math.max(E0,1e-30));
      if(step%stride===0)record(step*h);
    }
    return {time,coordinates,velocities,energy:energies,dissipated,dt:h,initialEnergy:E0,energyBalanceRelative:Math.abs(energy()+diss-E0)/Math.max(E0,1e-30),peakEnergyRise};
  }
  // Complex steady response, exp(i*w*t). Positive background modal damping is explicit.
  function harmonicCoordinates(frequencies,b,load,c,zeta,f){
    const n=frequencies.length,w=2*Math.PI*f,A=zeros(2*n),rhs=load.concat(Array(n).fill(0));
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      const real=i===j?(2*Math.PI*frequencies[i])**2-w*w:0;
      const imag=w*(c*b[i]*b[j]+(i===j?2*zeta*2*Math.PI*frequencies[i]:0));
      A[i][j]=A[i+n][j+n]=real;A[i][j+n]=-imag;A[i+n][j]=imag;
    }
    const x=new lib.LuDecomposition(new Matrix(A)).solve(Matrix.columnVector(rhs)).to1DArray();
    if(!x.every(Number.isFinite))throw Error('HARMONIC_SINGULAR');
    return {real:x.slice(0,n),imag:x.slice(n)};
  }
  function frequencyResponse(frequencies,V,recovery,h,n,fixed){
    const {node=n,axis=2,force=100,frequency=10,zeta=.02,damper={node:n,axis:2,c:10000}}=h;
    if(!Number.isInteger(node)||node<1||node>n||![0,1,2].includes(axis)||!(force>0&&force<=10000)||!(frequency>0&&frequency<=2000)||!(zeta>=.001&&zeta<=.1)||!Number.isInteger(damper.node)||damper.node<1||damper.node>n||![0,1,2].includes(damper.axis)||!(damper.c>=0&&damper.c<=100000))throw Error('HARMONIC_INPUT');
    const b=V[6*damper.node+damper.axis],load=V[6*node+axis].map(v=>v*force),probe=V[6*node+axis];
    const evaluate=(f,c)=>{const q=harmonicCoordinates(frequencies,b,load,c,zeta,f),re=probe.reduce((s,x,i)=>s+x*q.real[i],0),im=probe.reduce((s,x,i)=>s+x*q.imag[i],0);return {...q,amplitude:Math.hypot(re,im),phase:Math.atan2(im,re)};};
    const current=evaluate(frequency,damper.c),reference=evaluate(frequency,0);
    const upper=frequencies[0]*2;
    const sweep=Array.from({length:161},(_,i)=>{const f=frequencies[0]*(.2+1.8*i/160);return {frequency:f,withDamper:evaluate(f,damper.c).amplitude,withoutDamper:evaluate(f,0).amplitude};});
    const field=q=>recovery.map(p=>p.map(m=>({real:m.map(r=>r.reduce((s,x,i)=>s+x*q.real[i],0)),imag:m.map(r=>r.reduce((s,x,i)=>s+x*q.imag[i],0))})));
    const power=2*Math.PI*frequency,dr=b.reduce((s,x,i)=>s+x*current.real[i],0),di=b.reduce((s,x,i)=>s+x*current.imag[i],0);
    return {node,axis,force,frequency,zeta,damper,modeCount:frequencies.length,modalFrequencies:frequencies,current,reference,field:field(current),referenceField:field(reference),sweep,sweepUpper:upper,damperForce:damper.c*power*Math.hypot(dr,di),blocked:fixed.has(6*node+axis)};
  }
  if(typeof module!=='undefined')module.exports={solve,decay,harmonicCoordinates};else root.PipeSolver={solve,decay,harmonicCoordinates};
})(typeof globalThis==='undefined'?self:globalThis);
