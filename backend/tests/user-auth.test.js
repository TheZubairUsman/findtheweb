const request = require('supertest');
const app = require('../src/index');
const { User } = require('../src/models');

describe('Member authentication', () => {
  it('registers a member with a safe profile shape and signs them in', async () => {
    const registration = await request(app).post('/api/v1/auth/register').send({
      email: 'member@example.com', password: 'strong-password-123', firstName: 'Curious', lastName: 'Builder',
    });
    expect(registration.status).toBe(201);
    expect(registration.body.token).toBeDefined();
    expect(registration.body.user.name).toBe('Curious Builder');
    expect(registration.body.user.password).toBeUndefined();
    expect(registration.body.user.emailVerificationToken).toBeUndefined();

    const login = await request(app).post('/api/v1/auth/login').send({ email: 'MEMBER@EXAMPLE.COM', password: 'strong-password-123' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();

    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe('member@example.com');
  });

  it('rejects invalid member credentials without leaking account state', async () => {
    await User.create({ email: 'member@example.com', password: 'strong-password-123', name: 'Member', role: 'user', isActive: true, emailVerified: true });
    const response = await request(app).post('/api/v1/auth/login').send({ email: 'member@example.com', password: 'wrong-password' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
