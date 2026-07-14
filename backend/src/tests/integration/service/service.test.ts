import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../app';

let authCookie: string;
let serviceId: string;

describe('Service API - Integration Tests', () => {
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ritesh@gmail.com', password: '12345678' });
    
    const cookies = res.headers['set-cookie'];
    authCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  describe('POST /api/v1/service', () => {
    it('should create a service', async () => {
      const res = await request(app)
        .post('/api/v1/service')
        .set('Cookie', authCookie)
        .send({
          name: 'Test Service',
          price: 1000,
          description: 'TEST_Service',
        });

      serviceId = res.body.data.id;

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Service');
      expect(res.body.data.serviceCode).toBeDefined();
      expect(res.body.data.price).toBe('1000');
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .post('/api/v1/service')
        .send({ name: 'Test', price: 1000 });

      expect(res.status).toBe(401);
    });

    it('should reject missing name', async () => {
      const res = await request(app)
        .post('/api/v1/service')
        .set('Cookie', authCookie)
        .send({ price: 1000 });

      expect(res.status).toBe(400);
    });

    it('should reject missing price', async () => {
      const res = await request(app)
        .post('/api/v1/service')
        .set('Cookie', authCookie)
        .send({ name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('should reject negative price', async () => {
      const res = await request(app)
        .post('/api/v1/service')
        .set('Cookie', authCookie)
        .send({ name: 'Test', price: -100, description: 'TEST_Negative' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/service', () => {
    it('should get all services', async () => {
      const res = await request(app)
        .get('/api/v1/service')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/service/:id', () => {
    it('should get service by id', async () => {
      const res = await request(app)
        .get(`/api/v1/service/${serviceId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(serviceId);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app)
        .get('/api/v1/service/nonexistent123')
        .set('Cookie', authCookie);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/service/:id', () => {
    it('should update service', async () => {
      const res = await request(app)
        .put(`/api/v1/service/${serviceId}`)
        .set('Cookie', authCookie)
        .send({ name: 'Updated Service', price: 2000 });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Service');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app)
        .put('/api/v1/service/nonexistent123')
        .set('Cookie', authCookie)
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/service/:id', () => {
    it('should delete service', async () => {
      const res = await request(app)
        .delete(`/api/v1/service/${serviceId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app)
        .delete('/api/v1/service/nonexistent123')
        .set('Cookie', authCookie);

      expect(res.status).toBe(404);
    });
  });
});