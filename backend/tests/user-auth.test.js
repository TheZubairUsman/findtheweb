const request = require('supertest');
const app = require('../src/index');
const { User } = require('../src/models');

describe('Member authentication', () => {
  it('registers an unverified member without issuing a session token', async () => {
    const registration = await request(app).post('/api/v1/auth/register').send({
      email: 'member@example.com', password: 'strong-password-123', firstName: 'Curious', lastName: 'Builder',
    });
    expect(registration.status).toBe(201);
    expect(registration.body.token).toBeUndefined();
    expect(registration.body.user.name).toBe('Curious Builder');
    expect(registration.body.user.password).toBeUndefined();
    expect(registration.body.user.emailVerificationToken).toBeUndefined();

    const login = await request(app).post('/api/v1/auth/login').send({ email: 'MEMBER@EXAMPLE.COM', password: 'strong-password-123' });
    expect(login.status).toBe(403);
    expect(login.body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('rejects invalid member credentials without leaking account state', async () => {
    await User.create({ email: 'member@example.com', password: 'strong-password-123', name: 'Member', role: 'user', isActive: true, emailVerified: true });
    const response = await request(app).post('/api/v1/auth/login').send({ email: 'member@example.com', password: 'wrong-password' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
