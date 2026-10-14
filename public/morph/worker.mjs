import {design,forward,branches} from './physics.mjs?v=motor1';
self.onmessage=({data})=>{const {id,task,...args}=data;try{
 let result;
 if(task==='design')result=design(args.target,args.shape,args.warm,args.rotating,args.baseAngle);
 if(task==='forward')result={state:forward(args.k,true,args.baseAngle||0),k:args.k};
 if(task==='branches')result=branches(args.p);
 if(task==='path'){
  result=Array.from({length:91},(_,i)=>forward(args.k.map(v=>v*i/90),true,(args.baseAngle||0)*i/90));
  if(result.some(s=>!s.accepted||s.stability!=='stable'))throw Error('Path verification failed');
 }
 self.postMessage({id,task,result});
 }catch(e){self.postMessage({id,task,error:e.message});}};
