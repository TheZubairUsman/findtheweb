const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {imageMetadata}=require('./image-metadata.cjs');
const root=path.resolve(__dirname,'..');
function local(file){assert(typeof file==='string'&&!path.isAbsolute(file),'Use repository-relative paths');const target=path.resolve(root,file),relative=path.relative(root,target);assert(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative),'Path must stay in repository');return target;}
function jsonFile(file){const target=local(file),relative=path.relative(root,target).replaceAll('\\','/');assert(/^(?:content|tmp)\/[a-zA-Z0-9/_-]+\.json$/.test(relative),'Use JSON files inside content or tmp');return target;}
function prepare(config){
 assert(/^[a-z0-9][a-z0-9-]{2,71}$/.test(config.releaseId),'Invalid release id');
 assert(Array.isArray(config.articles)&&config.articles.length>0&&config.articles.length<=10,'Use 1-10 articles');
 const raw=fs.readFileSync(jsonFile(config.baseline),'utf8');const baseline=JSON.parse(raw.split(/\r?\n/).find(l=>l.startsWith('[{'))||raw);
 assert(Array.isArray(baseline)&&new Set(baseline.map(r=>r.slug)).size===baseline.length,'Unique live baseline required');
 const records=[],seen=new Set();
 for(const item of config.articles){
  const draft=JSON.parse(fs.readFileSync(jsonFile(item.draft),'utf8')),current=baseline.find(r=>r.slug===draft.slug);
  assert(current&&!seen.has(draft.slug),'Missing or duplicate article');seen.add(draft.slug);
  assert.equal(draft.expectedContentSha256,current.expectedContentSha256,'Content changed since research');assert.equal(draft.title,current.expectedTitle,'Title changed since research');
  assert(/^[a-f0-9]{64}$/.test(current.expectedContentSha256)&&/^[a-f0-9]{64}$/.test(current.expectedFeaturedImageSha256),'Live comparison hashes required');
  const words=draft.content.replace(/<[^>]*>/g,' ').trim().split(/\s+/).length;assert(words>=900&&words<=1600,'Article needs length review');
  assert(!/<h1\b|<(?:script|iframe|form|object|embed)\b|\son\w+\s*=/i.test(draft.content),'Unsafe article markup');assert(/<figure\b/.test(draft.content)&&/<figcaption\b/.test(draft.content),'Process figure required');
  assert(Array.isArray(draft.sources)&&draft.sources.length>0,'Sources required');const sources=new Set(draft.sources);
  for(const link of draft.content.matchAll(/href="([^"]+)"/g)){const value=link[1].replaceAll('&amp;','&'),url=new URL(value);assert(url.protocol==='https:'&&!url.username&&!url.password&&sources.has(value),'Document each HTTPS source');}
  assert(/^[a-z0-9][a-z0-9-]{2,100}\.png$/.test(item.cover),'Versioned PNG basename required');
  const optimized=item.cover.replace(/\.png$/,'.webp'),png=fs.readFileSync(local('dist/editorial-images/'+item.cover)),webp=fs.readFileSync(local('dist/editorial-images/'+optimized));
  const a=imageMetadata(png),b=imageMetadata(webp);assert(a.format==='png'&&b.format==='webp'&&a.width===b.width&&a.height===b.height&&webp.length<500000,'Review optimized asset dimensions/budget');
  // A richer inventory may contain the previous body or image. Carry only the
  // comparison fields across; never replace the reviewed draft with old copy.
  records.push({...draft,slug:current.slug,expectedTitle:current.expectedTitle,expectedContentSha256:current.expectedContentSha256,expectedFeaturedImageSha256:current.expectedFeaturedImageSha256,expectedFields:current.expectedFields,publishedAt:current.publishedAt,featuredImage:'https://findtheweb.zus3cu.tech/editorial-images/'+optimized,expectedSocialImage:'https://findtheweb.zus3cu.tech/editorial-images/'+item.cover});
 }
 const output=jsonFile(config.output),payload=JSON.stringify(records,null,2)+'\n';
 assert(![config.baseline,...config.articles.map(r=>r.draft)].some(file=>jsonFile(file)===output),'Output cannot replace an input');
 if(fs.existsSync(output))assert.equal(fs.readFileSync(output,'utf8').replace(/\r\n/g,'\n'),payload,'Existing release differs; review before choosing a new output');
 else fs.writeFileSync(output,payload,{flag:'wx'});return records;
}
if(require.main===module){
 const config=JSON.parse(fs.readFileSync(jsonFile(process.argv[2]),'utf8')),records=prepare(config);
 if(process.argv.includes('--update-map')){const file=local('backend/src/data/social-covers.json'),map=JSON.parse(fs.readFileSync(file));for(const record of records)map[record.slug]={sourceSha256:crypto.createHash('sha256').update(record.featuredImage).digest('hex'),url:record.expectedSocialImage};fs.writeFileSync(file,JSON.stringify(map,null,2)+'\n');}
 console.log(JSON.stringify({release:config.releaseId,articles:records.map(r=>({slug:r.slug,words:r.content.replace(/<[^>]*>/g,' ').trim().split(/\s+/).length,sources:r.sources.length}))}));
}
module.exports={prepare};
