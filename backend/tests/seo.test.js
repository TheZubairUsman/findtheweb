const request = require('supertest');
const app = require('../src/index');
const { BlogPost } = require('../src/models');

describe('SEO feeds', () => {
  beforeEach(async () => {
    await BlogPost.create({
      title: 'SEO verification article',
      content: 'A published article used to verify dynamic discovery feeds.',
      excerpt: 'A short SEO verification article.',
      status: 'published',
    });
  });

  it('generates a database-backed sitemap', async () => {
    const response = await request(app).get('/api/v1/seo/sitemap.xml');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/xml/);
    expect(response.text).toContain('/blog/seo-verification-article');
  });

  it('generates an RSS feed for published articles', async () => {
    const response = await request(app).get('/api/v1/seo/rss.xml');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/rss\+xml/);
    expect(response.text).toContain('SEO verification article');
  });
});

