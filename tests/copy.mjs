import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const element={setAttribute(){},textContent:''};
const context={window:{},URLSearchParams,location:{search:'?lang=en',hostname:'localhost'},document:{documentElement:{},body:{nodeType:1,matches:()=>false,childNodes:[]},querySelector:()=>element,getElementById:()=>element},MutationObserver:class{observe(){}}};
vm.runInNewContext(fs.readFileSync('public/material-memory/i18n.js','utf8'),context);
const translate=context.window.DenimI18n.english;
for(const phrase of ['模型对比','模型结构','加载进度','比较两个时刻','模型如何保留加载历史？','可回看的历史范围','DENIM 按力学方程计算弹塑性响应，用网络更新未知的硬化项。内部变量随加载过程保留，供下一步计算使用。']){
  assert(!/[\u3400-\u9fff]/.test(translate(phrase)),`Missing English: ${phrase}`);
}
assert.equal(translate('误差是 DENIM 的 68 倍'),'Error relative to DENIM: 68×');
assert.equal(translate('误差仅为 DENIM 的 1/2'),'Error relative to DENIM: 1/2');
const resource=fs.readFileSync('public/open-science/language.js','utf8');
assert(resource.includes('案例与数据'));
assert(!resource.includes('开放的起点'));
const architecture=fs.readFileSync('public/material-memory/app.js','utf8');
assert(!architecture.includes('历史感受野'));
assert(architecture.includes("name: 'Causal TCN'"));
assert(!fs.readFileSync('public/material-memory/index.html','utf8').includes('六种'));
console.log('Copy, translation coverage and error-ratio wording PASS');
