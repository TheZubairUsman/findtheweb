const crypto=require('crypto');
const fields=['content','excerpt','seoTitle','seoDescription'];
const digest=value=>crypto.createHash('sha256').update(value||'').digest('hex');
async function applyEditorialRelease({sequelize,BlogPost,records,backup}){
 return sequelize.transaction(async transaction=>{
  const prepared=[];
  for(const record of records){
   const post=await BlogPost.findOne({where:{slug:record.slug},transaction});
   if(!post||post.status!=='published'||!post.publishedAt||post.publishedAt>new Date())throw Error('Published article required: '+record.slug);
   if(digest(post.content)!==record.expectedContentSha256)throw Error('Content changed since audit: '+record.slug);
   for(const field of ['excerpt','seoTitle','seoDescription'])if((post[field]??null)!==(record.expectedFields[field]??null))throw Error('Metadata changed since audit: '+record.slug);
   if(typeof record.content!=='string'||record.content.length<3000)throw Error('Substantive article body required');
   prepared.push({post,record});
  }
  await backup(prepared.map(({post})=>({id:post.id,slug:post.slug,fields:Object.fromEntries(fields.map(f=>[f,post[f]]))})));
  const result=[];
  for(const {post,record} of prepared){const publishedAt=post.publishedAt;for(const field of fields)post[field]=record[field];await post.save({transaction});
   if(post.status!=='published'||+post.publishedAt!==+publishedAt)throw Error('Publication state changed');
   result.push({slug:post.slug,contentSha256:digest(post.content),readingTime:post.readingTime});
  }
  return result;
 });
}
module.exports={applyEditorialRelease,digest};
