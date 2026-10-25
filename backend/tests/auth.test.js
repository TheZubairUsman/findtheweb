const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const { Admin } = require('../src/models');

describe('Authentication Routes', () => {
  describe('POST /api/v1/auth/admin/login', () => {
    beforeEach(async () => {
      // Create test admin
      await Admin.create({
        email: 'test@admin.com',
        password: 'testpassword123',
        name: 'Test Admin'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({
          email: 'test@admin.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.admin.email).toBe('test@admin.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({
          email: 'test@admin.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({
          email: 'nonexistent@admin.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/admin/logout', () => {
    let authToken;

    beforeEach(async () => {
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
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/admin/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/admin/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('rejects an admin token with the wrong issuer', async () => {
      const forged = jwt.sign(
        { id: 1, role: 'admin' },
        process.env.JWT_SECRET,
        { issuer: 'unexpected-issuer', audience: 'findtheweb-admin-ui' }
      );
      const response = await request(app)
        .post('/api/v1/auth/admin/logout')
        .set('Authorization', `Bearer ${forged}`);

      expect(response.status).toBe(401);
    });

    it('rejects a non-admin role even when the token is otherwise valid', async () => {
      const forged = jwt.sign(
        { id: 1, role: 'user' },
        process.env.JWT_SECRET,
        { issuer: 'findtheweb-admin', audience: 'findtheweb-admin-ui' }
      );
      const response = await request(app)
        .post('/api/v1/auth/admin/logout')
        .set('Authorization', `Bearer ${forged}`);

      expect(response.status).toBe(403);
    });
  });
});
