const request = require('supertest');
const app = require('../src/index');
const { Category, Website, WebsiteFeedback } = require('../src/models');

describe('Discovery feedback', () => {
  let website;

  beforeEach(async () => {
    const category = await Category.create({ name: 'Feedback', slug: `feedback-${Date.now()}` });
    website = await Website.create({
      name: 'Feedback Tool',
      url: 'https://feedback.example.com',
      description: 'A public tool used to verify structured discovery feedback.',
      categoryId: category.id,
      status: 'active',
    });
  });

  test('records one privacy-safe visitor feedback and returns counts', async () => {
    const response = await request(app)
      .post(`/api/v1/discover/${website.id}/feedback`)
      .send({ signal: 'useful', triedIt: true, note: 'Clear and useful.' });

    expect(response.status).toBe(201);
    expect(response.body.data.counts).toEqual({ useful: 1, not_useful: 0, triedIt: 1 });
    expect(await WebsiteFeedback.count({ where: { websiteId: website.id } })).toBe(1);
    expect(await WebsiteFeedback.findOne({ where: { websiteId: website.id } })).not.toHaveProperty('ip');
  });

  test('updates the same visitor feedback instead of farming votes', async () => {
    const first = await request(app)
      .post(`/api/v1/discover/${website.id}/feedback`)
      .send({ signal: 'useful', triedIt: false });
    const second = await request(app)
      .post(`/api/v1/discover/${website.id}/feedback`)
      .send({ signal: 'not_useful', triedIt: true });

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.data.counts).toEqual({ useful: 0, not_useful: 1, triedIt: 1 });
    expect(await WebsiteFeedback.count({ where: { websiteId: website.id } })).toBe(1);
  });
});
