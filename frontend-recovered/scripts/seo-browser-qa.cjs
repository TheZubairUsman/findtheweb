const fs=require('fs'),path=require('path'),assert=require('assert/strict'),cp=require('child_process');
const {chromium}=require('@playwright/test');
const root=path.resolve(__dirname,'../..'),dist=path.join(root,'dist'),output=path.join(root,'docs/qa/seo-20261027');
fs.mkdirSync(output,{recursive:true});
const flag=path.join(dist,'seo-ready.flag'),hadFlag=fs.existsSync(flag);
const containers=['findtheweb-seo-qa','findtheweb-seo-outage'];
const report={checks:[]};
function check(name,passed){report.checks.push({name,passed:!!passed});assert(passed,name);}
function start(name,port,api,documentRoot=dist){cp.execFileSync('docker',['run','--rm','-d','--network','host','--name',name,'-e','SEO_QA_PORT='+port,'-e','FINDTHEWEB_SEO_API_BASE='+api,'--mount',`type=bind,src=${documentRoot},dst=/var/www/html,readonly`,'findtheweb-seo-qa'],{stdio:'pipe'});}
async function ready(port){for(let i=0;i<60;i++){try{let r=await fetch(`http://127.0.0.1:${port}/robots.txt`);if(r.ok)return;}catch(_){}await new Promise(r=>setTimeout(r,250));}throw Error('Apache QA not ready');}
(async()=>{
 let browser;
 try{
  if(!hadFlag)fs.writeFileSync(flag,'enabled\n');
  start(containers[0],5098,'http://127.0.0.1:5097');await ready(5098);
  const url='http://127.0.0.1:5098/blog/safe-automation-qa-guide';
  const response=await fetch(url);const html=await response.text();
  check('Apache serves a real article with status 200',response.status===200 && html.includes('Build a reliable workflow'));
  check('raw HTML has one canonical and article preview',(html.match(/rel="canonical"/g)||[]).length===1 && (html.match(/property="og:image"/g)||[]).length===1 && html.includes('property="og:type" content="article"'));
  check('server output excludes active article payload',!html.includes('window.unsafe') && !html.includes('onerror='));
  check('raw HTML has a single main heading',(html.match(/<h1\b/g)||[]).length===1);
  check('article schema describes visible content',html.includes('"@type":"BlogPosting"') && html.includes('Safe automation QA guide'));
  for(const slug of ['seo-private-draft','seo-future-article','missing-seo-article']){
   const r=await fetch('http://127.0.0.1:5098/blog/'+slug);const body=await r.text();
   check('unavailable article returns real 404: '+slug,r.status===404 && !body.includes('PrivateMarker') && !body.includes('FutureMarker'));
  }
  const traversal=await fetch('http://127.0.0.1:5098/seo.php?slug=..%2F..%2Fetc%2Fpasswd');
  check('invalid slug cannot select files or upstream URLs',traversal.status===404);
  const sitemap=await (await fetch('http://127.0.0.1:5098/sitemap.xml')).text();
  const rss=await (await fetch('http://127.0.0.1:5098/rss.xml')).text();
  check('public sitemap uses the current published database',sitemap.includes('/blog/safe-automation-qa-guide') && !sitemap.includes('seo-future-article') && !sitemap.includes('seo-private-draft') && !sitemap.includes('/discover</loc>'));
  check('public RSS uses the current published database',rss.includes('Safe automation QA guide') && !rss.includes('seo-future-article'));
  start(containers[1],5099,'http://127.0.0.1:59999');await ready(5099);
  const outage=await fetch('http://127.0.0.1:5099/blog/safe-automation-qa-guide');
  check('upstream outage is retryable 503 instead of a false 200',outage.status===503 && outage.headers.get('retry-after')==='60' && (await outage.text()).includes('noindex,nofollow'));
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || (process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':chromium.executablePath())});
  const context=await browser.newContext({javaScriptEnabled:false});
  await context.route('https://findtheweb.zus3cu.tech/**',async route=>{
   const target=path.resolve(dist,'.'+new URL(route.request().url()).pathname);
   if(target.startsWith(dist+path.sep)&&/\.png$/.test(target)&&fs.existsSync(target))return route.fulfill({status:200,contentType:'image/png',body:fs.readFileSync(target)});
   return route.abort();
  });
  const page=await context.newPage();
  for(const width of [375,1440]){
   await page.setViewportSize({width,height:900});await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.getByRole('heading',{name:'Safe automation QA guide',exact:true}).waitFor();
   check('article is readable without JavaScript at '+width+'px',await page.getByRole('heading',{name:'Build a reliable workflow',exact:true}).isVisible());
   check('no-JavaScript article does not overflow at '+width+'px',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   await page.screenshot({path:path.join(output,'no-js-'+width+'.png'),fullPage:true});
  }
  const hydrated=await browser.newContext({colorScheme:'light'});
  await hydrated.route('https://api.zus3cu.tech/findtheweb/**',async route=>{const r=await route.fetch({url:route.request().url().replace('https://api.zus3cu.tech/findtheweb','http://127.0.0.1:5097')});await route.fulfill({response:r});});
  const client=await hydrated.newPage();const errors=[];client.on('pageerror',e=>errors.push(e.message));
  await client.goto(url,{waitUntil:'domcontentloaded'});await client.locator('.prose').waitFor();
  check('React takes over server content without duplicate articles',await client.locator('#root h1').count()===1 && await client.locator('.seo-copy').count()===0 && errors.length===0);
  check('React replaces server article schema without duplicate metadata',await client.evaluate(()=>document.querySelectorAll('link[rel="canonical"]').length===1 && document.querySelectorAll('meta[property="og:image"]').length===1 && [...document.querySelectorAll('script[type="application/ld+json"]')].filter(e=>{try{return ['Article','BlogPosting'].includes(JSON.parse(e.textContent)['@type']);}catch(_){return false;}}).length===1));
  await client.setViewportSize({width:375,height:900});
  const figure=client.locator('.prose figure').first();await figure.waitFor();
  await client.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const light=await figure.evaluate(el=>getComputedStyle(el).backgroundColor);
  for(const theme of ['light','dark']){
   if(theme==='dark'){await client.getByRole('button',{name:'Toggle dark mode',exact:true}).click();await client.waitForFunction(()=>document.documentElement.classList.contains('dark'));}
   const violations=await client.evaluate(async()=>{const result=await axe.run(document.querySelector('.prose figure'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return result.violations.map(v=>v.id);});
   check('editorial figure has no detected accessibility violations in '+theme,violations.length===0);
   check('mobile editorial figure avoids horizontal overflow in '+theme,await client.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  }
  check('editorial figure follows the theme toggle',light!==await figure.evaluate(el=>getComputedStyle(el).backgroundColor));
  await client.screenshot({path:path.join(output,'editorial-dark-mobile.png'),fullPage:true});
  await hydrated.close();await context.close();
  cp.execFileSync('docker',['rm','-f',containers[0]],{stdio:'ignore'});
  start(containers[0],5098,'http://127.0.0.1:5097',root);await ready(5098);
  const deployed=await fetch(url);check('repository-root hosting renders article HTML',deployed.status===200 && (await deployed.text()).includes('id="seo-article"'));
  for(const feed of ['sitemap.xml','rss.xml']){const r=await fetch('http://127.0.0.1:5098/'+feed);check('repository-root hosting renders '+feed,r.status===200&&(await r.text()).includes(feed==='sitemap.xml'?'<urlset':'<rss'));}
  check('repository-root hosting preserves missing article 404',(await fetch('http://127.0.0.1:5098/blog/missing-seo-article')).status===404);
  for(const internal of ['backend/package.json','content/editorial-release-20261027.json','tools/verify-seo-live.cjs'])check('repository-root hosting denies '+internal,(await fetch('http://127.0.0.1:5098/'+internal)).status===403);
 }catch(error){report.failure=error.message;process.exitCode=1;}
 finally{
  if(browser)await browser.close();
  for(const name of containers)try{cp.execFileSync('docker',['rm','-f',name],{stdio:'ignore'});}catch(_){}
  if(!hadFlag&&fs.existsSync(flag))fs.unlinkSync(flag);
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }
})();
