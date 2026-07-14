import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';

let authCookie: string;

describe('Auth API - Integration Tests', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials and set cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'ritesh@gmail.com',
          password: '12345678',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.data.user.email).toBe('ritesh@gmail.com');
      expect(res.body.data.user.role).toBe('ADMIN');

      // Get cookie from response headers
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      authCookie = Array.isArray(cookies) ? cookies[0] : cookies;
      expect(authCookie).toContain('twipra-token');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'ritesh@gmail.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with missing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: '12345678',
        });

      expect(res.status).toBe(400);
    });

    it('should reject login with missing password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'ritesh@gmail.com',
        });

      expect(res.status).toBe(400);
    });

    it('should reject login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexist@test.com',
          password: '12345678',
        });

      expect(res.status).toBe(401);
    });
  });
});


describe('GET /api/v1/auth/me', () => {
  it('should return current user with valid cookie', async () => {
    // Login first
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ritesh@gmail.com', password: '12345678' });
    
    const cookies = loginRes.headers['set-cookie'];
    const cookie = Array.isArray(cookies) ? cookies[0] : cookies;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe('ritesh@gmail.com');
    expect(res.body.data.role).toBe('ADMIN');
  });

  it('should reject without cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('should logout and clear cookie', async () => {
    // Login first
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ritesh@gmail.com', password: '12345678' });
    
    const cookies = loginRes.headers['set-cookie'];
    const cookie = Array.isArray(cookies) ? cookies[0] : cookies;

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject logout without cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout');

    expect(res.status).toBe(401);
  });
});