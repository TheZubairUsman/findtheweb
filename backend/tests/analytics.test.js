const request = require('supertest');
const app = require('../src/index');

describe('Privacy-safe analytics events', () => {
  test('accepts an allowlisted event without requiring identity data', async () => {
    const response = await request(app)
      .post('/api/v1/analytics/events')
      .send({
        event: 'article_open',
        path: '/blog/example',
        slug: 'example',
      });

    expect(response.statusCode).toBe(202);
    expect(response.body).toEqual({ success: true, accepted: true });
  });

  test('rejects unsupported events', async () => {
    const response = await request(app)
      .post('/api/v1/analytics/events')
      .send({ event: 'email_capture', path: '/blog' });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
