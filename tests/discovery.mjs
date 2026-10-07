import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const pages=['','structural-design/','material-memory/','open-science/'];
const sitemap=fs.readFileSync('public/sitemap.xml','utf8');
for(const page of pages){
  const html=fs.readFileSync(`public/${page}index.html`,'utf8');
  const canonical=`https://lab.haoming-luo.com/${page}`;
  assert(html.includes(`<link rel="canonical" href="${canonical}">`));
  assert(sitemap.includes(`<loc>${canonical}</loc>`));
  assert(html.includes('name="description"'));
  assert(html.includes('property="og:title"'));
  for(const [,json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) assert.equal(JSON.parse(json)['@context'],'https://schema.org');
}
assert(fs.readFileSync('public/robots.txt','utf8').includes('Sitemap: https://lab.haoming-luo.com/sitemap.xml'));
const html=fs.readFileSync('public/open-science/index.html','utf8');
const elements=[...html.matchAll(/data-i18n="([^"]+)"[^>]*>([\s\S]*?)<\//g)].map(([,key,text])=>({dataset:{i18n:key},innerHTML:text}));
const button={setAttribute(){},addEventListener(_event,fn){this.toggle=fn;}};
const document={documentElement:{},querySelector:()=>button,querySelectorAll:()=>elements};
const script=fs.readFileSync('public/open-science/language.js','utf8');
vm.runInNewContext(script,{document,location:{search:''},URLSearchParams});
assert.equal(document.documentElement.lang,'en');
button.toggle();
assert.equal(document.documentElement.lang,'zh-CN');
assert(elements.every(el=>typeof el.innerHTML==='string'&&el.innerHTML.length>0));
button.toggle();
assert.equal(document.documentElement.lang,'en');
for(const [,ref] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(ref.startsWith('https:')||ref.startsWith('data:'))continue;
  assert(fs.existsSync(new URL(ref,new URL('../public/open-science/',import.meta.url))),ref);
}
console.log('Canonical URLs, metadata, sitemap, bilingual copy and local links PASS');
