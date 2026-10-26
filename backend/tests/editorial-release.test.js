const {sequelize,BlogPost}=require('../src/models');
const {applyEditorialRelease,digest}=require('../src/services/editorialRelease');
describe('Guarded editorial updates',()=>{
 it('preserves URL, status and publication date, with a backup before update',async()=>{
  const post=await BlogPost.create({title:'Original title',slug:'preserved-editorial-url',content:'Old content',status:'published'});
  const date=+post.publishedAt;let captured;
  await applyEditorialRelease({sequelize,BlogPost,records:[{slug:post.slug,expectedContentSha256:digest(post.content),expectedFields:{excerpt:null,seoTitle:null,seoDescription:null},content:'<p>'+('Original technical guidance. '.repeat(160))+'</p>',excerpt:'New excerpt',seoTitle:'Clear title',seoDescription:'Clear description'}],backup:rows=>{captured=rows;}});
  await post.reload();expect(post.slug).toBe('preserved-editorial-url');expect(post.status).toBe('published');expect(+post.publishedAt).toBe(date);expect(captured[0].fields.content).toBe('Old content');expect(post.readingTime).toBeGreaterThan(1);
 });
 it('aborts all writes when an audited record has changed',async()=>{
  const post=await BlogPost.create({title:'Concurrent update',slug:'concurrent-editorial',content:'A newer edit',status:'published'});
  let backed=false;
  await expect(applyEditorialRelease({sequelize,BlogPost,records:[{slug:post.slug,expectedContentSha256:digest('Older content'),expectedFields:{}}],backup:()=>{backed=true;}})).rejects.toThrow('Content changed since audit');
  expect(backed).toBe(false);await post.reload();expect(post.content).toBe('A newer edit');
 });
});
