const request = require('supertest');
const app = require('../src/index');
const { Admin, Website, BlogPost, Category } = require('../src/models');

describe('Admin Routes', () => {
  let authToken;
  let testAdmin;

  beforeEach(async () => {
    // Create test admin and get auth token
    testAdmin = await Admin.create({
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
  });

  describe('GET /api/v1/admin/dashboard', () => {
    beforeEach(async () => {
      // Create test data for dashboard
      const category = await Category.create({
        name: 'Test Category',
        description: 'Test category'
      });

      await Website.bulkCreate([
        {
          name: 'Website 1',
          url: 'https://test1.com',
          description: 'Test website 1',
          tier: 'standard',
          categoryId: category.id,
          totalHits: 100
        },
        {
          name: 'Website 2',
          url: 'https://test2.com',
          description: 'Test website 2',
          tier: 'premium',
          categoryId: category.id,
          totalHits: 50
        }
      ]);

      await BlogPost.bulkCreate([
        {
          title: 'Blog Post 1',
          excerpt: 'Excerpt 1',
          content: 'Content 1',
          author: 'Author 1',
          category: 'test',
          status: 'published'
        },
        {
          title: 'Blog Post 2',
          excerpt: 'Excerpt 2',
          content: 'Content 2',
          author: 'Author 2',
          category: 'test',
          status: 'draft'
        }
      ]);
    });

    it('should get dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalWebsites');
      expect(response.body.data).toHaveProperty('totalPosts');
      expect(response.body.data).toHaveProperty('websitesByTier');
      expect(response.body.data.totalWebsites).toBe(2);
      expect(response.body.data.totalPosts).toBe(2);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should filter by time period', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard?period=week')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/websites', () => {
    beforeEach(async () => {
      const category = await Category.create({
        name: 'Test Category',
        description: 'Test category'
      });

      await Website.bulkCreate([
        {
          name: 'Website 1',
          url: 'https://test1.com',
          description: 'Test website 1',
          tier: 'standard',
          categoryId: category.id
        },
        {
          name: 'Website 2',
          url: 'https://test2.com',
          description: 'Test website 2',
          tier: 'premium',
          categoryId: category.id
        }
      ]);
    });

    it('should get paginated websites', async () => {
      const response = await request(app)
        .get('/api/v1/admin/websites?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter websites by tier', async () => {
      const response = await request(app)
        .get('/api/v1/admin/websites?tier=premium')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].tier).toBe('premium');
    });

    it('should search websites', async () => {
      const response = await request(app)
        .get('/api/v1/admin/websites?search=Website 1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/v1/admin/websites/:id/knowledge', () => {
    it('stores structured product knowledge without replacing existing metadata', async () => {
      const website = await Website.create({
        name: 'Knowledge Test Tool',
        url: 'https://knowledge.example.com',
        description: 'A tool used to verify structured product knowledge.',
        metadata: { existingFlag: true },
      });

      const response = await request(app)
        .patch(`/api/v1/admin/websites/${website.id}/knowledge`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product: {
            problem: 'Reduce research time',
            bestFor: ['Small technical teams'],
            notFor: ['Offline-only workflows'],
            lastVerifiedAt: '2026-10-25',
          },
        });

      expect(response.status).toBe(200);
      const saved = await Website.findByPk(website.id);
      expect(saved.metadata.existingFlag).toBe(true);
      expect(saved.metadata.product.problem).toBe('Reduce research time');
      expect(saved.metadata.product.bestFor).toEqual(['Small technical teams']);
    });
  });

  describe('GET /api/v1/admin/categories', () => {
    beforeEach(async () => {
      await Category.bulkCreate([
        {
          name: 'Category 1',
          description: 'Description 1',
          slug: 'category-1'
        },
        {
          name: 'Category 2',
          description: 'Description 2',
          slug: 'category-2'
        }
      ]);
    });

    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/categories');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/admin/websites/bulk-upload', () => {
    it('should handle bulk upload with valid JSON', async () => {
      const websitesData = [
        {
          name: 'Bulk Website 1',
          url: 'https://bulk1.com',
          description: 'Bulk website 1',
          tier: 'standard'
        },
        {
          name: 'Bulk Website 2',
          url: 'https://bulk2.com',
          description: 'Bulk website 2',
          tier: 'premium'
        }
      ];

      const response = await request(app)
        .post('/api/v1/admin/websites/bulk-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(JSON.stringify(websitesData)), 'websites.json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.created).toBe(2);
    });

    it('should require file upload', async () => {
      const response = await request(app)
        .post('/api/v1/admin/websites/bulk-upload')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate JSON format', async () => {
      const response = await request(app)
        .post('/api/v1/admin/websites/bulk-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('invalid json'), 'websites.json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('canonical blog content routes', () => {
    it('reads and writes blog posts through BlogPost storage', async () => {
      const createResponse = await request(app)
        .post('/api/v1/admin/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Canonical editorial workflow',
          content: 'A durable draft body for the editorial workflow.',
          excerpt: 'A durable editorial draft.',
          status: 'draft',
          categories: ['engineering'],
          tags: ['workflow'],
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data.slug).toBe('canonical-editorial-workflow');

      const listResponse = await request(app)
        .get('/api/v1/admin/posts?status=draft')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data).toHaveLength(1);
      expect(listResponse.body.data[0].title).toBe('Canonical editorial workflow');
    });
  });
});

