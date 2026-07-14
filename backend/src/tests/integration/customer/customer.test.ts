import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../app';

let authCookie: string;
let customerId: string;

describe('Customer API - Integration Tests', () => {
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ritesh@gmail.com', password: '12345678' });
    
    const cookies = res.headers['set-cookie'];
    authCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  describe('POST /api/v1/customer', () => {
 it('should create a customer', async () => {
  const res = await request(app)
    .post('/api/v1/customer')
    .set('Cookie', authCookie)
    .send({
      name: 'Test Customer',
      email: `test-${Date.now()}@test.com`,
      phone: '98765432120',
      notes: 'TEST_Customer',
    });

  console.log('Status:', res.status);
  console.log('Body:', res.body);

  if (res.body.data) {
    customerId = res.body.data.id;
  }

  expect(res.status).toBe(201);
});

    it('should reject without auth', async () => {
      const res = await request(app)
        .post('/api/v1/customer')
        .send({ name: 'Test', phone: '9876543210' });

      expect(res.status).toBe(401);
    });

    it('should reject missing name', async () => {
      const res = await request(app)
        .post('/api/v1/customer')
        .set('Cookie', authCookie)
        .send({ phone: '9876543210' });

      expect(res.status).toBe(400);
    });

    it('should reject missing phone', async () => {
      const res = await request(app)
        .post('/api/v1/customer')
        .set('Cookie', authCookie)
        .send({ name: 'Test' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/customer', () => {
    it('should get all customers', async () => {
      const res = await request(app)
        .get('/api/v1/customer')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/customer/:id', () => {
    it('should get customer by id', async () => {
      const res = await request(app)
        .get(`/api/v1/customer/${customerId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(customerId);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app)
        .get('/api/v1/customer/nonexistent123')
        .set('Cookie', authCookie);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/customer/:id', () => {
    it('should update customer', async () => {
      const res = await request(app)
        .put(`/api/v1/customer/${customerId}`)
        .set('Cookie', authCookie)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/v1/customer/:id', () => {
    it('should delete customer', async () => {
      const res = await request(app)
        .delete(`/api/v1/customer/${customerId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
    });
  });
});


describe('POST /api/v1/customer - Additional Tests', () => {
  it('should reject duplicate email', async () => {
    // Create first customer
    const email = `duplicate-${Date.now()}@test.com`;
    await request(app)
      .post('/api/v1/customer')
      .set('Cookie', authCookie)
      .send({ name: 'First', email, phone: '9876543210', notes: 'TEST_Duplicate' });

    // Try same email again
    const res = await request(app)
      .post('/api/v1/customer')
      .set('Cookie', authCookie)
      .send({ name: 'Second', email, phone: '9876543211', notes: 'TEST_Duplicate' });

    expect(res.status).toBe(409);
  });

  it('should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/customer')
      .set('Cookie', authCookie)
      .send({ name: 'Test', email: 'notanemail', phone: '9876543210', notes: 'TEST_Invalid' });

    expect(res.status).toBe(400);
  });

  it('should reject short phone number', async () => {
    const res = await request(app)
      .post('/api/v1/customer')
      .set('Cookie', authCookie)
      .send({ name: 'Test', phone: '123', notes: 'TEST_ShortPhone' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/v1/customer/:id - Additional Tests', () => {
  it('should reject update with invalid email', async () => {
    const res = await request(app)
      .put(`/api/v1/customer/${customerId}`)
      .set('Cookie', authCookie)
      .send({ email: 'invalid' });

    expect(res.status).toBe(400);
  });

  it('should return 404 for non-existent id', async () => {
    const res = await request(app)
      .put('/api/v1/customer/nonexistent123')
      .set('Cookie', authCookie)
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/customer/:id - Additional Tests', () => {
  it('should return 404 for non-existent id', async () => {
    const res = await request(app)
      .delete('/api/v1/customer/nonexistent123')
      .set('Cookie', authCookie);

    expect(res.status).toBe(404);
  });
});