const assert=require('assert/strict');
const site='https://findtheweb.zus3cu.tech',api='https://api.zus3cu.tech/findtheweb';
const slugs=['technical-seo-for-a-javascript-website','a-human-workflow-for-checking-ai-generated-code'];
async function get(url){return fetch(url,{signal:AbortSignal.timeout(25000)});}
(async()=>{
 const probe=process.argv.includes('--probe'),checks=[];
 for(const slug of slugs){
  const r=await get(api+'/api/v1/seo/articles/'+slug),j=await r.json();assert.equal(r.status,200);assert(j.data.content);assert.deepEqual(Object.keys(j.data.author),['name']);
  const path=probe?'/seo.php?kind=article&slug='+slug:'/blog/'+slug;
  const page=await get(site+path),html=await page.text();assert.equal(page.status,200);assert(!html.includes('<?php'));assert(html.includes('id="seo-article"'));assert(html.includes(j.data.content));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert(html.includes('"@type":"BlogPosting"'));assert(html.includes(j.data.socialImage));
  const image=await get(j.data.socialImage);assert.equal(image.status,200);const bytes=Buffer.from(await image.arrayBuffer());assert.equal(bytes.subarray(1,4).toString(),'PNG');
  checks.push({slug,status:page.status,rawArticle:true,canonical:true,png:true,words:j.data.content.replace(/<[^>]*>/g,' ').trim().split(/\s+/).length});
 }
 const missing=await get(site+(probe?'/seo.php?kind=article&slug=':'/blog/')+'missing-seo-check-20261027');assert.equal(missing.status,404);
 const sitemap=await get(site+(probe?'/seo.php?kind=sitemap':'/sitemap.xml'));assert.equal(sitemap.status,200);const xml=await sitemap.text();assert(xml.includes('<urlset'));for(const slug of slugs)assert(xml.includes('/blog/'+slug));
 const rss=await get(site+(probe?'/seo.php?kind=rss':'/rss.xml'));assert.equal(rss.status,200);assert((await rss.text()).includes('<rss'));
 const protectedPaths=[];
 if(!probe)for(const path of ['/.env','/.git/config','/backend/package.json','/content/editorial-release-20261027.json','/tools/verify-seo-live.cjs']){
  const response=await fetch(site+path,{method:'HEAD',signal:AbortSignal.timeout(25000)});assert([403,404].includes(response.status),'Internal path must be unavailable: '+path);protectedPaths.push({path,status:response.status});
 }
 console.log(JSON.stringify({checkedAt:new Date().toISOString(),mode:probe?'direct-PHP':'canonical-routes',checks,missingStatus:missing.status,sitemapUrls:(xml.match(/<url>/g)||[]).length,rss:true,protectedPaths}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
