import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public/structural-design');
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,name]of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g))assert(fs.existsSync(path.join(root,name)),name);
for(const href of ['file:///tmp/展示/index.html','https://haoming-luo.github.io/haoming-lab/structural-design/']){
 const context={URL,Blob,Response,DecompressionStream,Uint8Array,atob,location:{href}};context.window=context;
 vm.createContext(context);
 for(const f of ['data.js','static-runtime.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context);
 const data=await context.LAB_STATIC_READY;
 assert.equal(data.bank.length,48);
 const get=async route=>{const r=await context.fetch(route);assert.equal(r.status,200,route);return r.json();};
 assert.equal((await get('/api/bracket/status')).state,'ready');
 for(let slider=4;slider<=14;slider++){
  const limit=slider/1000;const result=await get('/api/bracket/search?limit_mm='+limit);
  const eligible=data.bank.filter(c=>c.seat_prediction_mm>0&&c.seat_prediction_mm<=limit*.9);
  const expected=eligible.reduce((a,c)=>!a||c.mass_kg<a.mass_kg?c:a,null);
  assert.equal(result.selected?.id,expected?.id);assert.equal(result.eligible_count,eligible.length);
 }
 for(const row of data.bank){
  const query=new URLSearchParams(Object.entries(row.design).filter(([k])=>k!=='name'));
  const result=await get('/api/bracket/predict?'+query);assert.equal(result.id,row.id);assert.equal(result.matched,true);
  const field=await get(result.surface);assert(field.prediction);assert.equal(field.points.length,field.displacement.length);
  assert(result.cad.startsWith('blob:'));assert((await (await fetch(result.cad)).text()).includes('ISO-10303-21'));
 }
 for(const key of Object.keys(data.files))assert.equal(JSON.stringify(await get(key)),JSON.stringify(data.files[key]));
 const nearest=await get('/api/bracket/predict?depth=.0221&radius=.0198&waist=.316&bow=.0093');
 assert(nearest.precomputed);assert(data.bank.some(c=>c.id===nearest.id));assert(!nearest.matched);
 assert.equal((await context.fetch('/api/bracket/predict?depth=1&radius=.0198&waist=.316&bow=.0093')).status,409);
 assert.equal((await context.fetch('/api/bracket/predict?depth=.02')).status,409);
 assert.equal((await context.fetch('/not-in-package')).status,404);
 // A caller must not mutate the frozen records (the viewer rescales FEM fields).
 const a=await get('expansion_pilot/reinforced/surface.json');a.displacement[0][0]=12345;
 const b=await get('expansion_pilot/reinforced/surface.json');assert.notEqual(b.displacement[0][0],12345);
 for(const url of Object.values(context.LAB_STATIC_LINKS))URL.revokeObjectURL(url);
 console.log(href+': all fields, CAD, 48 exact matches, 11 thresholds, nearest match and errors PASS');
}
console.log('All JavaScript syntax and local asset references PASS');
