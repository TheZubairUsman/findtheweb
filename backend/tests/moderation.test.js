const request = require('supertest');
const app = require('../src/index');
const { Admin, Category, Website } = require('../src/models');

describe('Discovery moderation routes', () => {
  let authToken;
  let category;

  beforeEach(async () => {
    const admin = await Admin.create({
      email: 'moderator@admin.com',
      password: 'testpassword123',
      name: 'Moderator',
    });
    const login = await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ email: admin.email, password: 'testpassword123' });
    authToken = login.body.data.token;
    category = await Category.create({ name: 'Moderation Test', description: 'Test category for moderation' });
  });

  it('lists pending submissions and approves one', async () => {
    const submission = await Website.create({
      name: 'Pending Tool',
      url: 'https://pending-tool.example.com',
      description: 'A pending tool submitted for moderation testing.',
      categoryId: category.id,
      status: 'pending',
    });

    const list = await request(app)
      .get('/api/v1/admin/submissions')
      .set('Authorization', `Bearer ${authToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const review = await request(app)
      .patch(`/api/v1/admin/submissions/${submission.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ decision: 'approve' });
    expect(review.status).toBe(200);
    expect(review.body.data.status).toBe('active');
    expect((await Website.findByPk(submission.id)).status).toBe('active');
  });
});

