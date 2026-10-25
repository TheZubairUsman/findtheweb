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
    const response = await request(app).get('/api/v1/discover?sort=trending');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('Published Discovery Tool');
    expect(response.body.pagination.total).toBe(1);
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
});
