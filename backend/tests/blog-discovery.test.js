const request = require('supertest');
const app = require('../src/index');
const { BlogPost } = require('../src/models');

describe('Blog discovery reliability', () => {
  let current;
  beforeEach(async () => {
    current = await BlogPost.create({ title: 'Security guide', content: 'Security guidance.', status: 'published', categories: ['Cybersecurity'], tags: ['privacy'] });
    await BlogPost.bulkCreate([
      { title: 'Related security', content: 'Useful guidance.', status: 'published', categories: ['Cybersecurity'], tags: ['privacy'] },
      { title: 'Unrelated design', content: 'Design guidance.', status: 'published', categories: ['Design'], tags: ['layout'] },
      { title: 'Scheduled security', content: 'Future guidance.', status: 'published', publishedAt: new Date(Date.now() + 86400000), categories: ['Cybersecurity'], tags: ['privacy'] },
      { title: 'Draft security', content: 'Private draft.', status: 'draft', categories: ['Cybersecurity'], tags: ['privacy'] },
    ]);
  });

  it('filters JSON categories and tags together on SQLite', async () => {
    const response = await request(app).get('/api/v1/blog/posts').query({ category: 'Cybersecurity', tag: 'privacy' });
    expect(response.status).toBe(200);
    expect(response.body.data.map(post => post.title).sort()).toEqual(['Related security', 'Security guide']);
  });

  it('searches without database-specific operators', async () => {
    const response = await request(app).get('/api/v1/blog/posts').query({ search: 'DESIGN' });
    expect(response.status).toBe(200);
    expect(response.body.data.map(post => post.title)).toEqual(['Unrelated design']);
  });

  it('suggests relevant articles and excludes current, draft, scheduled and unrelated posts', async () => {
    const related = await current.getRelatedPosts(3);
    expect(related.map(post => post.title)).toEqual(['Related security']);
  });

  it('serves related articles through the public detail endpoint', async () => {
    const response = await request(app).get(`/api/v1/blog/posts/${current.slug}`);
    expect(response.status).toBe(200);
    expect(response.body.data.relatedPosts.map(post => post.title)).toEqual(['Related security']);
  });
});
