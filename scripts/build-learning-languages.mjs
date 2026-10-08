import fs from 'node:fs';
import {translations} from './learning-locales.mjs';
const root='public/learn/';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const files={zh:'index.html',en:'en.html',fr:'fr.html'};
export function buildLanguages(original){
 const source=JSON.parse(fs.readFileSync(root+'lessons.json','utf8'));
 const pages={};
 for(const [lang,file] of Object.entries(files)){
  let html=original;
  if(lang!=='zh'){
   const data=JSON.parse(fs.readFileSync(root+`lessons.${lang}.json`,'utf8'));
   const pairs=translations.map(row=>[row[0],row[lang==='en'?1:2]]);
   for(const key of ['title','intro','ready','common'])pairs.push([esc(source[key]),esc(data[key])]);
   for(let i=0;i<source.lessons.length;i++)for(const key of Object.keys(source.lessons[i])){
    if(['id','number'].includes(key))continue;
    pairs.push([esc(source.lessons[i][key]),esc(data.lessons[i][key])]);
   }
   const map=new Map(pairs);
   const regex=new RegExp([...map.keys()].sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
   html=html.replace(regex,key=>map.get(key))
    .replace('lang="zh-CN"',`lang="${lang}"`)
    .replace('href="https://lab.haoming-luo.com/learn/"',`href="https://lab.haoming-luo.com/learn/${file}"`)
    .replaceAll('public/learn/lessons.json',`public/learn/lessons.${lang}.json`)
    .replace(/AgentFEM-first-simulations\.(pdf|docx)/g,`AgentFEM-first-simulations-${lang}.$1`)
    .replace(/src="assets\/(beam|cylinder|steady|transient)\.png"/g,`src="assets/$1-${lang}.png"`);
  }
  const nav=`<nav class="languages" aria-label="Language">${Object.entries(files).map(([l,f])=>`<a href="${f}" lang="${l}" hreflang="${l}" data-language="${l}"${l===lang?' aria-current="page"':''}>${{zh:'中文',en:'EN',fr:'FR'}[l]}</a>`).join('')}</nav>`;
  html=html.replace('</header>',nav+'</header>').replace('</head>',Object.entries(files).map(([l,f])=>`<link rel="alternate" hreflang="${l==='zh'?'zh-CN':l}" href="https://lab.haoming-luo.com/learn/${l==='zh'?'':f}">`).join('')+'<script src="languages.js" defer></script></head>');
  pages[lang]=html;
  fs.writeFileSync(root+file,html);
 }
 // One offline file contains all languages, including figures. No CDN or network dependency.
 const bodies={};
 for(const [lang,html] of Object.entries(pages)){
  bodies[lang]=html.match(/<body>([\s\S]*)<\/body>/)[1]
   .replace(/src="assets\/([^\"]+\.png)"/g,(_m,name)=>`src="data:image/png;base64,${fs.readFileSync(root+'assets/'+name).toString('base64')}"`)
   .replace(/href="([^"#]+)"/g,(m,href)=>/^(https?:|data:)/.test(href)?m:`href="${new URL(href,'https://lab.haoming-luo.com/learn/')}"`)
   .replace('</h1>',`</h1><p class="small">${translations.find(x=>x[0].startsWith('离线版 ·'))[{zh:0,en:1,fr:2}[lang]]}</p>`);
 }
 const json=JSON.stringify(bodies).replaceAll('<','\\u003c');
 let offline=pages.zh.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_m,ref)=>`<style>${fs.readFileSync(new URL(ref,new URL('../public/learn/',import.meta.url)),'utf8')}</style>`)
  .replace(/<script src="[^\"]+" defer><\/script>/g,'')
  .replace(/<body>[\s\S]*<\/body>/,()=>`<body>${bodies.zh}<script id="offline-translations" type="application/json">${json}</script><script>${fs.readFileSync(root+'copy.js','utf8')}\n${fs.readFileSync(root+'languages.js','utf8')}</script></body>`);
 fs.writeFileSync(root+'AgentFEM-learning-offline.html',offline);
 console.log('Built Chinese, English, French and trilingual offline pages');
}
