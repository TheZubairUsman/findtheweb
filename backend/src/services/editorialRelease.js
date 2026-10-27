const crypto=require('crypto');
const fields=['content','excerpt','seoTitle','seoDescription'];
const digest=value=>crypto.createHash('sha256').update(value||'').digest('hex');
const fingerprint=values=>digest(JSON.stringify(values));
async function applyEditorialRelease({sequelize,BlogPost,records,backup,dryRun=false}){
 if(!Array.isArray(records)||records.length<1||records.length>10||new Set(records.map(r=>r.slug)).size!==records.length)throw Error('A batch requires 1-10 unique article slugs');
 return sequelize.transaction(async transaction=>{
  const prepared=[];
  for(const record of records){
   const post=await BlogPost.findOne({where:{slug:record.slug},transaction});
   if(!post||post.status!=='published'||!post.publishedAt||post.publishedAt>new Date())throw Error('Published article required: '+record.slug);
   if(record.expectedTitle&&post.title!==record.expectedTitle)throw Error('Title changed since audit: '+record.slug);
   if(digest(post.content)!==record.expectedContentSha256)throw Error('Content changed since audit: '+record.slug);
   for(const field of ['excerpt','seoTitle','seoDescription'])if((post[field]??null)!==(record.expectedFields[field]??null))throw Error('Metadata changed since audit: '+record.slug);
   if(Object.hasOwn(record,'featuredImage')&&digest(post.featuredImage)!==record.expectedFeaturedImageSha256)throw Error('Cover changed since audit: '+record.slug);
   if(typeof record.content!=='string'||record.content.length<3000)throw Error('Substantive article body required');
   if(/<(?:script|iframe|form|object|embed)\b|\son\w+\s*=/i.test(record.content))throw Error('Active article markup is not permitted');
   if(Object.hasOwn(record,'featuredImage')&&!/^https:\/\/findtheweb\.zus3cu\.tech\/editorial-images\/[a-z0-9_-]+\.(?:png|webp|jpe?g)$/.test(record.featuredImage))throw Error('Reviewed first-party cover required');
   prepared.push({post,record,selected:[...fields,...(Object.hasOwn(record,'featuredImage')?['featuredImage']:[])]});
  }
  if(dryRun)return prepared.map(({post,record,selected})=>({id:post.id,slug:post.slug,fields:selected,contentSha256:digest(record.content)}));
  await backup(prepared.map(({post,selected})=>({id:post.id,slug:post.slug,publishedAt:post.publishedAt,fields:Object.fromEntries(selected.map(f=>[f,post[f]]))})));
  const result=[];
  for(const {post,record,selected} of prepared){const publishedAt=post.publishedAt;for(const field of selected)post[field]=record[field];await post.save({transaction});
   if(post.status!=='published'||+post.publishedAt!==+publishedAt)throw Error('Publication state changed');
   result.push({id:post.id,slug:post.slug,contentSha256:digest(post.content),fieldsSha256:fingerprint(Object.fromEntries(selected.map(f=>[f,post[f]]))),readingTime:post.readingTime});
  }
  return result;
 });
}
async function restoreEditorialRelease({sequelize,BlogPost,previous,applied}){
 if(!Array.isArray(previous)||!previous.length||previous.length>10||previous.length!==applied.length||new Set(previous.map(r=>r.slug)).size!==previous.length)throw Error('Complete unique rollback receipts required');
 return sequelize.transaction(async transaction=>{
  const prepared=[];
  for(const row of previous){
   const receipt=applied.find(r=>r.id===row.id&&r.slug===row.slug);
   const keys=Object.keys(row.fields);if(!keys.length||keys.some(k=>![...fields,'featuredImage'].includes(k)))throw Error('Invalid rollback fields');
   const post=await BlogPost.findOne({where:{id:row.id,slug:row.slug},transaction});
   if(!post||post.status!=='published'||+post.publishedAt!==+new Date(row.publishedAt))throw Error('Publication changed after release: '+row.slug);
   if(!receipt||fingerprint(Object.fromEntries(keys.map(k=>[k,post[k]])))!==receipt.fieldsSha256)throw Error('Article changed after release: '+row.slug);
   prepared.push({post,row});
  }
  for(const {post,row}of prepared){for(const [key,value]of Object.entries(row.fields))post[key]=value;await post.save({transaction});}
  return prepared.map(({post})=>({slug:post.slug,contentSha256:digest(post.content)}));
 });
}
module.exports={applyEditorialRelease,restoreEditorialRelease,digest,editorialReleaseVersion:2};
