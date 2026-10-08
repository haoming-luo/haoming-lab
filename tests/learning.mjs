import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const data=JSON.parse(fs.readFileSync('public/learn/lessons.json','utf8'));
assert.equal(data.lessons.length,4);
const html=fs.readFileSync('public/learn/index.html','utf8');
for(const lesson of data.lessons){
  assert(html.includes(lesson.prompt));assert(html.includes(lesson.result));
  assert(fs.statSync(`public/learn/assets/${lesson.id}.png`).size>5000);
}
for(const page of ['learn','notes/denim']){
  const source=fs.readFileSync(`public/${page}/index.html`,'utf8');
  assert(source.includes(`https://lab.haoming-luo.com/${page}/`));
  for(const [,ref] of source.matchAll(/(?:src|href)="([^"#]+)"/g)){
    if(ref.startsWith('https:'))continue;
    const local=new URL(ref,new URL(`../public/${page}/`,import.meta.url));local.hash='';local.search='';
    assert(fs.existsSync(local),ref);
  }
}
const ref=JSON.parse(fs.readFileSync('public/learn/assets/reference-results.json','utf8'));
assert(Math.abs(ref.beam_tip_mm/ref.beam_theory_mm-1)<.05);
assert(Math.abs(ref.steady_center_c-60)<1e-6);
assert(ref.transient_center_c>59&&ref.transient_center_c<60.01);
assert(fs.readFileSync('public/learn/AgentFEM-first-simulations.pdf').subarray(0,4).toString()==='%PDF');
let click, copied;
const button={dataset:{copy:'prompt-beam'},addEventListener(_event,fn){click=fn;}};
const status={classList:{add(){},remove(){}}};
vm.runInNewContext(fs.readFileSync('public/learn/copy.js','utf8'),{document:{querySelector:()=>null,querySelectorAll:()=>[button],getElementById:id=>id==='copy-status'?status:{textContent:data.lessons[0].prompt}},navigator:{clipboard:{async writeText(text){copied=text;}}},setTimeout(){}});
await click();assert.equal(copied,data.lessons[0].prompt);assert.equal(button.textContent,'已复制');
console.log('Four lessons, local links, reference values, PDF and copy interaction PASS');
