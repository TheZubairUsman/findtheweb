const request=require('supertest');
const app=require('../src/index');
const {BlogPost,Admin}=require('../src/models');
describe('Published HTML renderer data',()=>{
 it('sanitizes rich content, excludes identity fields and does not count a reader view',async()=>{
  const author=await Admin.create({name:'Editorial author',email:'seo-author@example.test',password:'Local-SEO-test-only!',isActive:true});
  const post=await BlogPost.create({title:'Safe <title> example',slug:'renderer-safe-example',authorId:author.id,status:'published',content:'<h1>Heading</h1><script>window.unsafe=1</script><p onclick="bad()">Useful text</p><a href="javascript:alert(1)">unsafe link</a><img src="/logo.png" onerror="bad()"><form action="https://example.test">Submit</form>'});
  const before=post.viewCount;
  const response=await request(app).get('/api/v1/seo/articles/'+post.slug);
  expect(response.status).toBe(200);expect(response.headers['cache-control']).toBe('no-store');
  expect(response.body.data.content).toContain('<h2>Heading</h2>');
  expect(response.body.data.content).not.toMatch(/<script|onclick|onerror|javascript:|<form/);
  expect(response.body.data.author).toEqual({name:'Editorial author'});
  expect(response.body.data).not.toHaveProperty('authorId');expect(response.body.data).not.toHaveProperty('viewCount');
  await post.reload();expect(post.viewCount).toBe(before);
 });
 it('never serves drafts, scheduled articles or administrator overrides',async()=>{
  const draft=await BlogPost.create({title:'Private draft',slug:'private-seo-draft',content:'Not public',status:'draft'});
  const future=await BlogPost.create({title:'Scheduled article',slug:'future-seo-article',content:'Not yet public',status:'published',publishedAt:new Date(Date.now()+86400000)});
  for(const slug of [draft.slug,future.slug,'missing-post']) expect((await request(app).get('/api/v1/seo/articles/'+slug+'?status=all')).status).toBe(404);
  const xml=await request(app).get('/api/v1/seo/sitemap.xml');const rss=await request(app).get('/api/v1/seo/rss.xml');
  for(const text of [xml.text,rss.text]){expect(text).not.toContain(draft.slug);expect(text).not.toContain(future.slug);}
 });
});
