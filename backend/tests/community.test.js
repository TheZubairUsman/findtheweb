const request = require('supertest');
const app = require('../src/index');
const { Admin, Category, Website, CommunityProfile, Collection } = require('../src/models');

describe('Community profiles, collections and follows', () => {
  let token;
  let admin;
  let website;

  beforeEach(async () => {
    admin = await Admin.create({ email: 'community-admin@example.com', password: 'testpassword123', name: 'Community Admin' });
    const login = await request(app).post('/api/v1/auth/admin/login').send({ email: admin.email, password: 'testpassword123' });
    token = login.body.data.token;
    const category = await Category.create({ name: 'Community Test', description: 'Test category' });
    website = await Website.create({ name: 'Community Website', url: 'https://community.example.com', description: 'A safe test website', categoryId: category.id, status: 'active' });
  });

  it('requires authentication for private community operations', async () => {
    const response = await request(app).get('/api/v1/community/me');
    expect(response.status).toBe(401);
  });

  it('creates a safe profile, collection and collection item', async () => {
    const profile = await request(app).get('/api/v1/community/me').set('Authorization', `Bearer ${token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data.profile.email).toBeUndefined();
    const created = await request(app).post('/api/v1/community/collections').set('Authorization', `Bearer ${token}`).send({ name: 'Useful Tools', description: 'A focused list' });
    expect(created.status).toBe(201);
    const item = await request(app).post(`/api/v1/community/collections/${created.body.data.id}/items`).set('Authorization', `Bearer ${token}`).send({ websiteId: website.id, note: 'Worth exploring' });
    expect(item.status).toBe(201);
    const detail = await request(app).get(`/api/v1/community/collections/${created.body.data.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.items[0].website.name).toBe('Community Website');
  });

  it('exposes public profiles without private fields and blocks self-follow', async () => {
    await request(app).get('/api/v1/community/me').set('Authorization', `Bearer ${token}`);
    const profile = await CommunityProfile.findOne({ where: { ownerId: admin.id } });
    const publicView = await request(app).get(`/api/v1/community/profiles/${profile.handle}`);
    expect(publicView.status).toBe(200);
    expect(publicView.body.data.profile.email).toBeUndefined();
    const follow = await request(app).post(`/api/v1/community/profiles/${profile.handle}/follow`).set('Authorization', `Bearer ${token}`);
    expect(follow.status).toBe(400);
  });

  it('enforces collection ownership', async () => {
    const other = await Admin.create({ email: 'other-community@example.com', password: 'testpassword123', name: 'Other Admin' });
    const collection = await Collection.create({ ownerId: other.id, ownerType: 'admin', name: 'Private List' });
    const response = await request(app).patch(`/api/v1/community/collections/${collection.id}`).set('Authorization', `Bearer ${token}`).send({ name: 'Hijacked' });
    expect(response.status).toBe(404);
  });
});
