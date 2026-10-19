importScripts('./vendor/matrix.umd.js','./solver.js');
self.onmessage=({data})=>{
  try{self.postMessage({id:data.id,result:PipeSolver.solve(data.request)});}
  catch(error){self.postMessage({id:data.id,error:error.message});}
};
