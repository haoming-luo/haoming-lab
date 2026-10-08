const {chromium}=require('playwright');
const fs=require('node:fs');
const {resolve}=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const ctx=await browser.newContext({offline:true,permissions:['clipboard-read','clipboard-write']});
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const offline of [false,true]){
   if(offline)await page.goto(pathToFileURL(resolve('public/learn/AgentFEM-learning-offline.html')).href);
   for(const lang of ['en','fr','zh']){
    const data=JSON.parse(fs.readFileSync('public/learn/lessons'+(lang==='zh'?'':'.'+lang)+'.json','utf8'));
    if(offline){await page.locator('header').scrollIntoViewIfNeeded();await page.locator(`[data-language="${lang}"]`).click();}
    else await page.goto(pathToFileURL(resolve('public/learn/'+(lang==='zh'?'index':lang)+'.html')).href);
    assert.equal((await page.locator('html').getAttribute('lang')).slice(0,2),lang);
    assert.equal(await page.locator('h1').textContent(),data.title);
    for(const ext of ['pdf','docx']){
     const filename=`AgentFEM-first-simulations${lang==='zh'?'':'-'+lang}.${ext}`;
     assert((await page.locator(`.download-options a[href$=".${ext}"]`).getAttribute('href')).endsWith(filename));
     assert(fs.statSync('public/learn/'+filename).size>10000);
    }
    for(const lesson of data.lessons){
     assert.equal(await page.locator('#prompt-'+lesson.id).textContent(),lesson.prompt);
     assert.equal(await page.locator('#follow-'+lesson.id).textContent(),lesson.follow);
    }
    for(const width of [1440,390]){
     await page.setViewportSize({width,height:900});
     await page.locator('header').scrollIntoViewIfNeeded();
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     await page.screenshot({path:`/private/tmp/learn-${lang}-${offline?'offline':'web'}-${width}.png`});
     await page.locator('#steady').scrollIntoViewIfNeeded();
     await page.screenshot({path:`/private/tmp/learn-${lang}-steady-${width}.png`});
    }
    for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();assert(await img.evaluate(i=>i.complete&&i.naturalWidth>0));}
    await page.locator('[data-copy="prompt-beam"]').click();
    await page.waitForFunction(()=>['Copied','Copié','已复制'].includes(document.querySelector('[data-copy="prompt-beam"]').textContent));
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),data.lessons[0].prompt);
   }
   // Old exercise hashes must not send a language switch back to Exercise 3.
   await page.evaluate(()=>{location.hash='steady';});
   await page.waitForFunction(()=>location.hash==='#steady');
   await page.locator('header').scrollIntoViewIfNeeded();
   await page.locator('[data-language="en"]').click();
   await page.waitForFunction(()=>document.documentElement.lang==='en'&&location.hash===''&&scrollY<5);
  }
  assert.deepEqual(errors,[]);
  console.log('Three languages: complete prompts, desktop/mobile layout, figures, offline switching and clipboard PASS');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
