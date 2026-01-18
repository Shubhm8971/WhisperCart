const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');

describe('Auth Endpoints', () => {
beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register a user with an existing email', async () => {
    await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser3',
        email: 'test2@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should login a registered user', async () => {
    await User.create({
      username: 'loginuser',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login a user with incorrect password', async () => {
    await User.create({
      username: 'loginuser2',
      email: 'login2@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login2@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('success', false);
  });
});
