// Local, isolated article-layout QA. No production API writes or account use.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('../frontend-recovered/node_modules/@playwright/test');
const {cleanContent}=require('../backend/src/services/editorialSeo');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),output=path.join(root,'docs/qa/editorial-library-20261028');
const audit=JSON.parse(fs.readFileSync(path.join(root,'tmp/editorial-library-audit.json')));
const requested=process.argv.find(a=>a.startsWith('--slug='))?.slice(7);
const selected=audit.results.filter(r=>!r.errors.length&&(!requested||r.slug===requested)),drafts=new Map(selected.map(r=>{const d=JSON.parse(fs.readFileSync(path.join(root,r.file)));return [d.slug,d];}));
assert(drafts.size,'No fully gated article drafts');fs.mkdirSync(output,{recursive:true});
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1'),file=path.resolve(dist,'.'+url.pathname);
 if(!file.startsWith(dist+path.sep)&&file!==dist){res.writeHead(403);return res.end();}
 const target=fs.existsSync(file)&&fs.statSync(file).isFile()?file:path.join(dist,'index.html');
 const ext=path.extname(target),types={'.js':'application/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
 let bytes=fs.readFileSync(target);if(['.html','.js'].includes(ext))bytes=Buffer.from(bytes.toString().replaceAll('https://api.zus3cu.tech/findtheweb','http://127.0.0.1:5096').replace(/<script\b[^>]*src="https:\/\/(?:www\.googletagmanager\.com|pagead2\.googlesyndication\.com)[^"]*"[^>]*><\/script>/g,''));
 res.setHeader('Content-Type',types[ext]||'application/octet-stream');res.end(bytes);
});
(async()=>{
 await new Promise(r=>server.listen(5096,'127.0.0.1',r));let browser;const report={scope:'Isolated local React and fallback-layout content fixtures; not a live production interaction audit.',checkedAt:new Date().toISOString(),articles:[],errors:[]};
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':chromium.executablePath())});
  const context=await browser.newContext({viewport:{width:375,height:900},colorScheme:'light'}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.hostname!=='127.0.0.1'&&!['data:','blob:'].includes(url.protocol))return route.abort();
   if(url.hostname==='127.0.0.1'&&/^\/(?:api\/v1\/)?(?:blog|analytics|categories|auth)(?:\/|$)/.test(url.pathname)&&request.resourceType()!=='document'){
    const slug=url.pathname.match(/\/(?:blog\/)?posts\/([^/?]+)$/)?.[1],draft=drafts.get(slug);
    if(draft){const data={...draft,featuredImage:'/editorial-images/'+draft.coverFile.replace(/\.png$/,'.webp'),socialImage:'https://findtheweb.zus3cu.tech/editorial-images/'+draft.coverFile,publishedAt:'2026-10-01T00:00:00Z',updatedAt:'2026-10-28T00:00:00Z',readingTime:6,categories:['Editorial QA'],tags:[],author:{name:'FindTheWeb Editorial'},relatedPosts:[]};return route.fulfill({json:{success:true,data}});}
    return route.fulfill({json:{success:true,data:[],pagination:{total:0,pages:1,page:1}}});
   }
   return route.continue();
  });
  let index=0;
  for(const [slug,draft]of drafts){
   await page.setViewportSize({width:375,height:900});await page.goto('http://127.0.0.1:5096/blog/'+slug,{waitUntil:'domcontentloaded'});await page.locator('.prose figure').first().waitFor();
   const result={slug,states:[]};
   for(const theme of ['light','dark']){
    const isDark=await page.evaluate(()=>document.documentElement.classList.contains('dark'));
    if(isDark!==(theme==='dark'))await page.getByRole('button',{name:'Toggle dark mode',exact:true}).click();
    await page.waitForFunction(wanted=>document.documentElement.classList.contains('dark')===wanted,theme==='dark');
    await page.locator('article').first().evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
    const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,figure:document.querySelectorAll('.prose figure').length,cover:[...document.images].some(i=>i.getAttribute('src')?.includes('/editorial-images/lib-')&&i.naturalWidth>=1200),numbered:getComputedStyle(document.querySelector('.prose figure ol')).listStyleType}));
    if(state.scrollWidth>state.width+2){report.overflow={slug,theme,...state,elements:await page.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,classes:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width,scroll:e.scrollWidth,overflow:getComputedStyle(e).overflowX,whiteSpace:getComputedStyle(e).whiteSpace,text:e.textContent?.slice(0,120)})).filter(e=>e.right>innerWidth+2).slice(-15))};await page.screenshot({path:path.join(output,'overflow.png'),fullPage:false});}
    assert(state.scrollWidth<=state.width+2,slug+' overflows '+theme);assert(state.h1===1&&state.figure>=1&&state.cover&&state.numbered==='decimal',slug+' missing reading structure');result.states.push({layout:'React',theme,...state});
   }
   await page.setViewportSize({width:1440,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),slug+' desktop overflow');result.desktop=true;
   const fallback=await context.newPage();await fallback.setViewportSize({width:375,height:900});await fallback.setContent('<html><head><style>'+fs.readFileSync(path.join(dist,'seo-render.css'),'utf8')+'</style></head><body><main class="seo-copy"><h1>'+escape(draft.title)+'</h1>'+cleanContent(draft.content)+'</main></body></html>');
   result.fallbackMobile=await fallback.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2);assert(result.fallbackMobile,slug+' fallback overflow');await fallback.close();
   if(index%32===0){await page.setViewportSize({width:375,height:900});await page.screenshot({path:path.join(output,'local-article-'+String(index+1).padStart(3,'0')+'.png'),fullPage:false});}
   index++;report.articles.push(result);fs.writeFileSync(path.join(output,'local-layout.json'),JSON.stringify(report,null,2));
  }
  assert.equal(report.errors.length,0,'Browser exceptions');console.log(JSON.stringify({articles:report.articles.length,states:report.articles.reduce((n,r)=>n+r.states.length+2,0),exceptions:report.errors.length,report:'docs/qa/editorial-library-20261028/local-layout.json'}));
 }catch(error){report.failure=error.message;process.exitCode=1;console.error(error.stack);}
 finally{fs.writeFileSync(path.join(output,'local-layout.json'),JSON.stringify(report,null,2));if(browser)await browser.close();server.close();}
})();
