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
});

