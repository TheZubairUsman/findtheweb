const request = require('supertest');
const app = require('../src/index');
const { Admin, Website, Category } = require('../src/models');

describe('Website Routes', () => {
  let authToken;
  let testCategory;

  beforeEach(async () => {
    // Create test admin and get auth token
    const admin = await Admin.create({
      email: 'test@admin.com',
      password: 'testpassword123',
      name: 'Test Admin'
    });

    const loginResponse = await request(app)
      .post('/api/v1/auth/admin/login')
      .send({
        email: 'test@admin.com',
        password: 'testpassword123'
      });

    authToken = loginResponse.body.data.token;

    // Create test category
    testCategory = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test category description'
    });
  });

  describe('GET /api/v1/websites', () => {
    beforeEach(async () => {
      // Create test websites
      await Website.bulkCreate([
        {
          name: 'Test Website 1',
          url: 'https://test1.com',
          description: 'Test website 1',
          tier: 'standard',
          categoryId: testCategory.id
        },
        {
          name: 'Test Website 2',
          url: 'https://test2.com',
          description: 'Test website 2',
          tier: 'premium',
          categoryId: testCategory.id
        }
      ]);
    });

    it('should get all websites', async () => {
      const response = await request(app)
        .get('/api/v1/websites');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'Test Website 1' }),
        expect.objectContaining({ name: 'Test Website 2' }),
      ]));
    });

    it('should filter websites by tier', async () => {
      const response = await request(app)
        .get('/api/v1/websites/tier/premium');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'Test Website 2', tier: 'premium' }),
      ]));
    });

    it('should search websites', async () => {
      const response = await request(app)
        .get('/api/v1/websites/search?q=Test Website 1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/websites/top', () => {
    beforeEach(async () => {
      // Create websites with different hit counts
      await Website.bulkCreate([
        {
          name: 'Popular Website',
          url: 'https://popular.com',
          description: 'Popular website',
          tier: 'standard',
          totalHits: 100,
          weeklyHits: 50,
          categoryId: testCategory.id
        },
        {
          name: 'Less Popular Website',
          url: 'https://less-popular.com',
          description: 'Less popular website',
          tier: 'standard',
          totalHits: 10,
          weeklyHits: 5,
          categoryId: testCategory.id
        }
      ]);
    });

    it('should get top websites by total hits', async () => {
      const response = await request(app)
        .get('/api/v1/websites/top?period=all');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].totalHits).toBeGreaterThan(response.body.data[1].totalHits);
    });

    it('should get top websites by weekly hits', async () => {
      const response = await request(app)
        .get('/api/v1/websites/top?period=week');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].weeklyHits).toBeGreaterThan(response.body.data[1].weeklyHits);
    });
  });

  describe('POST /api/v1/websites/:id/hit', () => {
    let testWebsite;

    beforeEach(async () => {
      testWebsite = await Website.create({
        name: 'Test Website',
        url: 'https://test.com',
        description: 'Test website',
        tier: 'standard',
        categoryId: testCategory.id
      });
    });

    it('should track website hit', async () => {
      const response = await request(app)
        .post(`/api/v1/websites/${testWebsite.id}/hit`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify hit was recorded
      await testWebsite.reload();
      expect(testWebsite.totalHits).toBe(1);
    });

    it('should handle non-existent website', async () => {
      const response = await request(app)
        .post('/api/v1/websites/999/hit');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin Website Management', () => {
    describe('POST /api/v1/admin/websites', () => {
      it('should create website with valid data', async () => {
        const websiteData = {
          name: 'New Website',
          url: 'https://newwebsite.com',
          description: 'A new website',
          tier: 'standard',
          categoryId: testCategory.id
        };

        const response = await request(app)
          .post('/api/v1/admin/websites')
          .set('Authorization', `Bearer ${authToken}`)
          .send(websiteData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(websiteData.name);
      });

      it('should reject creation without auth', async () => {
        const websiteData = {
          name: 'New Website',
          url: 'https://newwebsite.com',
          description: 'A new website',
          tier: 'standard'
        };

        const response = await request(app)
          .post('/api/v1/admin/websites')
          .send(websiteData);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/v1/admin/websites')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/v1/admin/websites/:id', () => {
      let testWebsite;

      beforeEach(async () => {
        testWebsite = await Website.create({
          name: 'Test Website',
          url: 'https://test.com',
          description: 'Test website',
          tier: 'standard',
          categoryId: testCategory.id
        });
      });

      it('should update website with valid data', async () => {
        const updateData = {
          name: 'Updated Website',
          description: 'Updated description'
        };

        const response = await request(app)
          .put(`/api/v1/admin/websites/${testWebsite.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updateData.name);
      });

      it('should handle non-existent website', async () => {
        const response = await request(app)
          .put('/api/v1/admin/websites/999')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ name: 'Updated' });

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/v1/admin/websites/:id', () => {
      let testWebsite;

      beforeEach(async () => {
        testWebsite = await Website.create({
          name: 'Test Website',
          url: 'https://test.com',
          description: 'Test website',
          tier: 'standard',
          categoryId: testCategory.id
        });
      });

      it('should delete website', async () => {
        const response = await request(app)
          .delete(`/api/v1/admin/websites/${testWebsite.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify website was deleted
        const deletedWebsite = await Website.findByPk(testWebsite.id);
        expect(deletedWebsite).toBeNull();
      });

      it('should handle non-existent website', async () => {
        const response = await request(app)
          .delete('/api/v1/admin/websites/999')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });
  });
});
