const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {imageMetadata}=require('./image-metadata.cjs');
const mode=process.argv[2],input=process.argv[3]||path.resolve(__dirname,'../content/editorial-safety1-20261027.json');
const releaseId=process.argv[4]||'safety1-20261027';assert(/^[a-z0-9][a-z0-9-]{2,71}$/.test(releaseId),'Invalid release id');
assert(['assets','published'].includes(mode),'Use assets or published');
const records=JSON.parse(fs.readFileSync(input)),site='https://findtheweb.zus3cu.tech',api='https://api.zus3cu.tech/findtheweb';
const get=url=>fetch(url,{signal:AbortSignal.timeout(25000)});
const text=html=>html.replace(/<[^>]*>/g,' ').replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,key)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '})[key]).replace(/&#(x[0-9a-f]+|\d+);/gi,(match,value)=>{const n=value[0].toLowerCase()==='x'?parseInt(value.slice(1),16):Number(value);return n>=0&&n<=0x10ffff?String.fromCodePoint(n):match;}).replace(/\s+/g,' ').trim();
(async()=>{
 const results=[];
 for(const record of records){
  assert(record.featuredImage.startsWith(site+'/editorial-images/'));
  const cover=await get(record.featuredImage);assert.equal(cover.status,200,'Cover not deployed');const bytes=Buffer.from(await cover.arrayBuffer());
  const {format,width,height}=imageMetadata(bytes);assert(format==='webp'&&width>=1200&&height>=630&&width/height>1.8&&width/height<2.1,'Landscape optimized cover dimensions');assert(bytes.length<500000,'Reading cover exceeds the reviewed delivery budget');
  const preview=await get(record.expectedSocialImage);assert.equal(preview.status,200);assert.equal(imageMetadata(Buffer.from(await preview.arrayBuffer())).format,'png');
  const result={slug:record.slug,coverStatus:cover.status,width,height,deliveredBytes:bytes.length,socialPreview:true};
  if(mode==='published'){
   const response=await get(api+'/api/v1/seo/articles/'+record.slug);assert.equal(response.status,200);const {data}=await response.json();
   assert.equal(text(data.content),text(record.content),'Published article differs from reviewed copy');assert.equal(data.image,record.featuredImage);assert.equal(data.readingImage,record.featuredImage);assert.equal(data.socialImage,record.expectedSocialImage);assert.equal(data.seoTitle,record.seoTitle);assert.equal(data.description,record.seoDescription);assert.equal(+new Date(data.publishedAt),+new Date(record.publishedAt));
   const page=await get(site+'/blog/'+record.slug),html=await page.text();assert.equal(page.status,200);assert(html.includes('id="seo-article"'));assert(html.includes(data.content));assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert.equal((html.match(/<h1\b/g)||[]).length,1);assert(html.includes(record.expectedSocialImage));assert(html.includes('src="'+record.featuredImage+'"'),'Server reader must not download the heavy social cover');
   result.rawArticle=true;result.originalPublicationDatePreserved=true;result.words=text(data.content).split(/\s+/).length;
  }
  results.push(result);
 }
 const privatePath=await fetch(site+'/backend/editorial-backups/'+releaseId+'/before.json',{method:'HEAD',signal:AbortSignal.timeout(25000)});assert([403,404].includes(privatePath.status));
 console.log(JSON.stringify({checkedAt:new Date().toISOString(),release:releaseId,mode,results,privateBackupStatus:privatePath.status}));
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
