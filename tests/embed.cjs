const {chromium}=require('/Users/luo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8784/open-science/embed/');
 for(const key of ['memory','bracket','pipe','rod']){
  await page.selectOption('#demo',key);
  const code=await page.inputValue('#code');assert(code.includes('<iframe'));assert(code.includes('https://lab.haoming-luo.com/'));
  assert(await page.locator('#preview').isHidden());
 }
 await page.click('#language');assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
 await page.click('#copy');await page.waitForFunction(()=>document.getElementById('status').textContent.length>0);
 await page.route('https://lab.haoming-luo.com/**',route=>route.fulfill({contentType:'text/html',body:'<h1>Preview fixture</h1>'}));
 await page.click('#show');assert.equal(await page.locator('iframe').count(),1);
 await page.selectOption('#demo','pipe');assert(await page.locator('#preview').isHidden());
 await page.screenshot({path:'/tmp/agentfem-embed-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'/tmp/agentfem-embed-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);await browser.close();console.log('Embed selectors, language, copy feedback, preview lifecycle, mobile width PASS');
})().catch(e=>{console.error(e);process.exit(1)});
