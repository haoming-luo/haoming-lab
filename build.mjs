import {cp,mkdir,stat,readFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});
for(const name of ['index.html','home.css','structural-design/index.html','structural-design/data.js','structural-design/static-runtime.js']) await stat(`dist/${name}`);
const home=await readFile('dist/index.html','utf8');
if(!home.includes('./structural-design/'))throw Error('Missing project entry');
console.log('Built homepage and complete static laboratory.');
