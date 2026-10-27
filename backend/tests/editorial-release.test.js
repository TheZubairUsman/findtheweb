const {sequelize,BlogPost}=require('../src/models');
const {applyEditorialRelease,restoreEditorialRelease,digest}=require('../src/services/editorialRelease');
describe('Guarded editorial updates',()=>{
 const record=post=>({slug:post.slug,expectedContentSha256:digest(post.content),expectedFields:{excerpt:post.excerpt,seoTitle:post.seoTitle,seoDescription:post.seoDescription},content:'<p>'+('Useful specific guidance. '.repeat(160))+'</p>',excerpt:'New excerpt',seoTitle:'New title',seoDescription:'New description'});
 it('previews without writing or creating a backup',async()=>{
  const post=await BlogPost.create({title:'Preview',slug:'preview-editorial',content:'Original',status:'published'});let backed=false;
  const result=await applyEditorialRelease({sequelize,BlogPost,records:[record(post)],dryRun:true,backup:()=>{backed=true;}});
  await post.reload();expect(post.content).toBe('Original');expect(backed).toBe(false);expect(result).toHaveLength(1);
 });
 it('restores the old short article and cover without resetting publication state',async()=>{
  const post=await BlogPost.create({title:'Restore',slug:'restore-editorial',content:'Original short article',featuredImage:'/old.png',status:'published'});let previous;
  const date=+post.publishedAt;const update={...record(post),featuredImage:'https://findtheweb.zus3cu.tech/editorial-images/restore-v2.png',expectedFeaturedImageSha256:digest(post.featuredImage)};
  const applied=await applyEditorialRelease({sequelize,BlogPost,records:[update],backup:rows=>{previous=rows;}});
  await restoreEditorialRelease({sequelize,BlogPost,previous,applied});await post.reload();
  expect(post.content).toBe('Original short article');expect(post.featuredImage).toBe('/old.png');expect(post.status).toBe('published');expect(+post.publishedAt).toBe(date);
 });
 it('does not roll back a newer editorial edit or partially restore a batch',async()=>{
  const one=await BlogPost.create({title:'One',slug:'rollback-one',content:'Original one',status:'published'}),two=await BlogPost.create({title:'Two',slug:'rollback-two',content:'Original two',status:'published'});let previous;
  const applied=await applyEditorialRelease({sequelize,BlogPost,records:[record(one),record(two)],backup:rows=>{previous=rows;}});
  await two.update({excerpt:'Newer manual edit'});
  await expect(restoreEditorialRelease({sequelize,BlogPost,previous,applied})).rejects.toThrow('Article changed after release');
  await one.reload();await two.reload();expect(one.content).not.toBe('Original one');expect(two.excerpt).toBe('Newer manual edit');
 });
 it('rejects duplicate slugs and concurrent cover changes before writes',async()=>{
  const post=await BlogPost.create({title:'Cover',slug:'cover-editorial',content:'Original',status:'published'});const update=record(post);
  await expect(applyEditorialRelease({sequelize,BlogPost,records:[update,update],dryRun:true})).rejects.toThrow('unique article slugs');
  await expect(applyEditorialRelease({sequelize,BlogPost,records:[{...update,featuredImage:'https://findtheweb.zus3cu.tech/editorial-images/cover-v2.png',expectedFeaturedImageSha256:'stale'}],dryRun:true})).rejects.toThrow('Cover changed since audit');
 });
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
