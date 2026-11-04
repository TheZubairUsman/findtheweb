const request = require('supertest');
const app = require('../src/index');
const { Category, Website } = require('../src/models');

describe('Discovery MVP routes', () => {
  let category;

  beforeEach(async () => {
    category = await Category.create({ name: 'Discovery Test', description: 'Test category for discovery' });
    await Website.create({
      name: 'Published Discovery Tool',
      url: 'https://discovery.example.com',
      description: 'A useful public discovery item for testing.',
      categoryId: category.id,
      status: 'active',
      totalHits: 20,
      weeklyHits: 8,
    });
    await Website.create({
      name: 'Pending Discovery Tool',
      url: 'https://pending.example.com',
      description: 'This item should remain hidden until moderation.',
      categoryId: category.id,
      status: 'pending',
    });
  });

  it('returns only active items in the public feed', async () => {
    const response = await request(app).get('/api/v1/discover?sort=trending&q=Published%20Discovery%20Tool');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('Published Discovery Tool');
    expect(response.body.pagination.total).toBe(1);
  });

  it('does not expose incomplete legacy export records', async () => {
    await Website.update({ status: 'inactive' }, { where: { status: 'active' } });
    const response = await request(app).get('/api/v1/discover?sort=newest&limit=30');
    expect(response.status).toBe(200);
    expect(response.body.data.every(item => item.name && /^https?:\/\//.test(item.url))).toBe(true);
    const incomplete = await request(app).get('/api/v1/discover/1792918074478');
    expect(incomplete.status).toBe(404);
  });

  it('queues a community submission as pending', async () => {
    const response = await request(app)
      .post('/api/v1/discover/submissions')
      .send({
        name: 'Community Tool',
        url: 'https://community.example.com',
        description: 'A community-submitted tool waiting for editorial review.',
        categoryId: category.id,
      });

    expect(response.status).toBe(202);
    expect(response.body.data.status).toBe('pending');
    const saved = await Website.findByPk(response.body.data.id);
    expect(saved.status).toBe('pending');
  });

  it('queues a legacy category selection without an invalid database foreign key', async () => {
    const response = await request(app).post('/api/v1/discover/submissions').send({
      name: 'Legacy Category Tool',
      url: 'https://legacy-category.example.com',
      description: 'A useful resource waiting for editorial review.',
      categoryId: 1,
    });
    expect(response.status).toBe(202);
    const saved = await Website.findByPk(response.body.data.id);
    expect(saved.status).toBe('pending');
    expect(saved.categoryId).toBeNull();
    expect(saved.metadata.submittedCategory.name).toBe('Technology');

    await saved.update({ status: 'active' });
    const search = await request(app).get('/api/v1/discover?q=Legacy%20Category%20Tool');
    expect(search.body.data).toHaveLength(1);
    expect(search.body.data[0].categoryId).toBe(1);
    const directory = await request(app).get('/api/v1/discover?limit=1');
    expect(directory.body.pagination.total).toBeGreaterThan(100);

    const invalid = await request(app).post('/api/v1/discover/submissions').send({
      name: 'Unknown Category Tool',
      url: 'https://unknown-category.example.com',
      description: 'This should not enter the moderation queue.',
      categoryId: 999999,
    });
    expect(invalid.status).toBe(400);
  });

  it('rejects malformed URLs and honeypot submissions', async () => {
    const malformed = await request(app)
      .post('/api/v1/discover/submissions')
      .send({
        name: 'Malformed Tool',
        url: 'javascript:alert(1)',
        description: 'This must not enter the moderation queue.',
        categoryId: category.id,
      });
    expect(malformed.status).toBe(400);
    expect(malformed.body.message).toMatch(/valid http or https URL/i);

    const bot = await request(app)
      .post('/api/v1/discover/submissions')
      .send({
        name: 'Bot Tool',
        url: 'https://bot.example.com',
        description: 'This must be rejected by the hidden honeypot.',
        categoryId: category.id,
        company: 'Automated Publisher',
      });
    expect(bot.status).toBe(400);
    expect(bot.body.message).toBe('Unable to receive submission');
  });

  it('returns a safe product knowledge shape on detail pages', async () => {
    const website = await Website.findOne({ where: { name: 'Published Discovery Tool' } });
    await website.update({ metadata: {
      internalOnly: 'must not leak',
      product: {
        problem: 'Find a useful tool quickly',
        bestFor: ['Researchers', 'Developers'],
        pricing: { model: 'freemium', summary: 'Free tier available' },
        privacy: { dataCollection: 'Minimal account data' },
        alternatives: [{ name: 'Alternative Tool', reason: 'More focused' }],
        lastVerifiedAt: '2026-10-25',
      },
    } });

    const response = await request(app).get(`/api/v1/discover/${website.id}`);
    expect(response.status).toBe(200);
    expect(response.body.data.product.problem).toBe('Find a useful tool quickly');
    expect(response.body.data.product.bestFor).toEqual(['Researchers', 'Developers']);
    expect(response.body.data.product.alternatives[0].name).toBe('Alternative Tool');
    expect(response.body.data.metadata).toBeUndefined();
  });

  it('links an article only to curated active websites', async () => {
    const linked = await request(app).get('/api/v1/discover/related/articles/a-human-workflow-for-checking-ai-generated-code');
    expect(linked.status).toBe(200);
    expect(linked.body.data.some(item => item.name === 'GitHub' || item.id === 'github')).toBe(true);
    expect(linked.body.data.every(item => item.id && item.name && !item.metadata && !item.submitterEmail)).toBe(true);
    const profile = await request(app).get(`/api/v1/discover/${linked.body.data[0].id}`);
    expect(profile.body.data.product.articleSlugs).toContain('a-human-workflow-for-checking-ai-generated-code');
    const invalid = await request(app).get('/api/v1/discover/related/articles/not%20a%20slug');
    expect(invalid.status).toBe(400);
  });
});
