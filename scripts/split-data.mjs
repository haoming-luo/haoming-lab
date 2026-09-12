// One-time migration of the original recorded archive; no simulation data changes.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const source=process.argv[2];if(!source)throw Error('Pass the original data.js path');
const ctx={window:{}};vm.runInNewContext(await readFile(source,'utf8'),ctx);
const data=JSON.parse(gunzipSync(Buffer.from(ctx.window.LAB_PACKED_DATA,'base64')));
const root='public/structural-design/assets';await mkdir(root,{recursive:true});
const index={bank:data.bank,status:data.status,files:{},cad:{}};
let total=0;
for(const kind of ['files','cad'])for(const [key,value]of Object.entries(data[kind])){
 const raw=kind==='cad'?value:JSON.stringify(value);
 const bytes=gzipSync(raw,{level:9});const hash=createHash('sha256').update(bytes).digest('hex').slice(0,16);
 const name=hash+(kind==='cad'?'.step.gz':'.json.gz');
 await writeFile(`${root}/${name}`,bytes);index[kind][key]=`assets/${name}`;total+=bytes.length;
}
await writeFile(`${root}/index.json`,JSON.stringify(index));
console.log(JSON.stringify({resources:total,indexBytes:Buffer.byteLength(JSON.stringify(index)),files:Object.keys(index.files).length,cad:Object.keys(index.cad).length}));
