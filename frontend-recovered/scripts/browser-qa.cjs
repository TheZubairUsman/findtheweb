const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const output = path.resolve(__dirname,'../../docs/qa/frontend-20261027');
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || (process.platform==='win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : chromium.executablePath()),headless:true});
 const context = await browser.newContext();
 // External marketing/profile services are outside this isolated functional QA.
 // The local QA host strips advertising/analytics script tags. Do not intercept
 // application modules: exercise the browser's actual native module loader.
 const page = await context.newPage();
 page.setDefaultTimeout(30000);
 page.setDefaultNavigationTimeout(60000);
 const go = async url=>{
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.locator('#root h1').first().waitFor({state:'visible'});
 };
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const report={routes:[],interactions:[],accessibility:[],errors};
 report.failedWrites=[];
 page.on('response',async response=>{
   const request=response.request();
   if(response.status()>=400 && /\/api\/v1\/(blog\/posts|contact)/.test(response.url()) && ['POST','PUT'].includes(request.method())) {
     report.failedWrites.push({path:new URL(response.url()).pathname,status:response.status(),body:(await response.text()).slice(0,1200)});
   }
 });
 const suffix=Date.now().toString();
 const draftTitle='QA source rebuild '+suffix;
 const draftSlug='qa-source-rebuild-'+suffix;
 const contactSubject='Frontend QA '+suffix;
 const check=(name,ok)=>{report.interactions.push({name,passed:!!ok});assert(ok,name);};
 try {
  const routes=['/','/categories','/category/task-management','/blog','/blog/safe-automation-qa-guide','/bookmarks','/about','/contact','/support','/privacy-policy','/terms-of-service','/cookie-policy','/sitemap','/admin/login','/discover','/submit','/community','/member/login','/member/register','/member/forgot-password'];
  for(const width of (process.argv.includes('--interactions-only') ? [] : [375,768,1440])){
   await page.setViewportSize({width,height:900});
   for(const route of routes){
    await go('http://127.0.0.1:5097'+route,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(350);
    const result=await page.evaluate(()=>({error:document.body.textContent.includes('Something went wrong'),notFound:document.querySelector('#root h1')?.textContent.trim()==='404',overflow:document.documentElement.scrollWidth>innerWidth+2,headings:document.querySelectorAll('#root h1').length}));
    report.routes.push({width,route,...result});
   }
   await go('http://127.0.0.1:5097/blog');
   await page.screenshot({path:path.join(output,`blog-${width}.png`),fullPage:true});
   console.log('Responsive routes checked at '+width+'px');
  }
  await page.setViewportSize({width:1440,height:900});
  await go('http://127.0.0.1:5097/blog');
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('button[aria-current="page"]')?.textContent.trim()==='2' || Array.from(document.querySelectorAll('button')).some(b=>b.textContent.trim()==='Previous'&&!b.disabled));
  check('pagination advances',await page.getByRole('button',{name:'Previous',exact:true}).isEnabled());
  await page.getByRole('button',{name:'Previous',exact:true}).click();
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(b=>b.textContent.trim()==='Previous'&&b.disabled));
  check('pagination returns',await page.getByRole('button',{name:'Previous',exact:true}).isDisabled());
  await page.getByLabel('Toggle dark mode').click();
  check('dark mode toggles',await page.locator('html').evaluate(e=>e.classList.contains('dark')));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.classList.contains('dark'));
  check('dark mode survives refresh',await page.locator('html').evaluate(e=>e.classList.contains('dark')));
  await page.screenshot({path:path.join(output,'blog-dark.png'),fullPage:true});
  await page.getByLabel('Toggle dark mode').click();
  check('light mode returns',!(await page.locator('html').evaluate(e=>e.classList.contains('dark'))));
  await page.getByRole('link',{name:'Skip to main content',exact:true}).focus();
  await page.keyboard.press('Enter');
  check('keyboard skip link reaches content',await page.evaluate(()=>document.activeElement?.id==='main-content'));
  await page.getByRole('combobox',{name:'Filter by category'}).selectOption('Cybersecurity');
  await page.waitForTimeout(400);
  check('category filter loads relevant article',await page.getByRole('link',{name:'Cybersecurity QA checklist',exact:true}).count()>0);
  await page.getByRole('textbox',{name:'Search articles'}).fill('zz-no-matching-article');
  await page.getByText(/No articles found/i).waitFor();
  check('search empty state',await page.getByText(/No articles found/i).count()>0);
  await go('http://127.0.0.1:5097/products');
  await page.waitForURL('**/blog'); check('products redirects to blog',page.url().endsWith('/blog'));
  await go('http://127.0.0.1:5097/blog/safe-automation-qa-guide');
  await page.waitForTimeout(400);
  check('article scripts do not execute',await page.evaluate(()=>!window.__unsafeArticle));
  check('article removes event handlers',await page.locator('.prose [onerror],.prose script').count()===0);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByText('Build a reliable workflow',{exact:true}).waitFor();
  check('article refresh loads content',await page.getByText('Build a reliable workflow',{exact:true}).count()>0);
  check('article preview metadata is unique',await page.locator('meta[property="og:image"]').count()===1 && await page.locator('link[rel="canonical"]').count()===1);
  await go('http://127.0.0.1:5097/admin/blog');
  await page.waitForURL('**/admin/login'); check('anonymous editor redirects',page.url().endsWith('/admin/login'));
  await page.getByLabel('Admin Email').fill('browser-qa@example.test');
  await page.getByLabel('Password',{exact:true}).fill('Local-QA-only-2026!');
  await page.getByRole('button',{name:'Access Admin Panel'}).click();
  await page.waitForURL(u=>u.pathname==='/admin/blog'||u.pathname==='/admin');
  check('isolated admin login works',!page.url().endsWith('/login'));
  await go('http://127.0.0.1:5097/admin/blog');
  await page.waitForTimeout(400);
  check('editor survives direct load',!(await page.locator('body').innerText()).includes('Access Denied'));
  await page.evaluate(()=>{window.__qaNativeFrame=requestAnimationFrame;window.requestAnimationFrame=callback=>window.__qaNativeFrame(time=>setTimeout(()=>callback(time),150));});
  await page.getByRole('button',{name:'New Post',exact:true}).click();
  await page.locator('#editor-content').focus();await page.waitForTimeout(250);
  check('delayed autofocus preserves selected editor field',await page.locator('#editor-content').evaluate(e=>document.activeElement===e));
  await page.evaluate(()=>{window.requestAnimationFrame=window.__qaNativeFrame;delete window.__qaNativeFrame;});
  await page.locator('#editor-title').fill(draftTitle);
  await page.locator('#editor-content').fill('<h2>Verified editor workflow</h2><p>This is an isolated test article.</p>');
  await page.getByRole('button',{name:'Create',exact:true}).click();
  await page.getByText('Post saved successfully.',{exact:true}).waitFor();
  check('editor saves and lists draft',await page.getByText(draftTitle,{exact:true}).count()>0);
  const row=page.getByRole('row').filter({hasText:draftTitle});
  await row.getByRole('button',{name:/edit/i}).click();
  await page.locator('#editor-status-select').selectOption('published');
  await page.getByRole('button',{name:'Update',exact:true}).click();
  await page.getByText('Post saved successfully.',{exact:true}).waitFor();
  await go('http://127.0.0.1:5097/blog/'+draftSlug);
  await page.getByText('Verified editor workflow',{exact:true}).waitFor();
  check('published article with no cover loads',await page.getByText('Verified editor workflow',{exact:true}).count()>0);
  await go('http://127.0.0.1:5097/contact');
  await page.locator('#name').fill('Isolated QA');await page.locator('#email').fill('qa@example.test');
  await page.locator('#subject').fill(contactSubject);await page.locator('#message').fill('Local-only contact persistence check. No external email requested.');
  await page.getByRole('button',{name:'Send Message'}).click();
  await page.getByText(/Message saved\. Reference:/).first().waitFor();
  check('contact confirms persisted message',await page.getByText(/Message saved\. Reference:/).count()>0);
  await page.goto('http://127.0.0.1:5097/admin/messages',{waitUntil:'domcontentloaded'});
  await page.locator('#ftw-inbox').getByText(contactSubject,{exact:true}).waitFor();
  check('admin inbox reads saved message',await page.locator('#ftw-inbox').getByText(contactSubject,{exact:true}).count()>0);
  for(const route of ['/blog','/contact','/admin/blog']) {
   await go('http://127.0.0.1:5097'+route);await page.waitForTimeout(300);
   await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
   const findings=await page.evaluate(async()=>{let r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length}));});
   report.accessibility.push({route,findings});
  }
  check('no uncaught browser exceptions',errors.length===0);
  check('all responsive routes avoid crashes, missing pages and overflow',report.routes.every(r=>!r.error&&!r.notFound&&!r.overflow));
 } catch(e){
   report.failure=e.message;
   report.failurePage={url:page.url(),text:(await page.locator('body').innerText().catch(()=>'' )).slice(-6500)};
   await page.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});
   process.exitCode=1;
 }
 finally{fs.writeFileSync(path.join(output,process.argv.includes('--interactions-only')?'interactions.json':'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({routes:report.routes.length,interactions:report.interactions,accessibility:report.accessibility,errors,failedWrites:report.failedWrites,failure:report.failure,failurePage:report.failurePage}));await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
