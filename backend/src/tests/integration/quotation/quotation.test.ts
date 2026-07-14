import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../app';

let authCookie: string;
let quotationId: string;
let customerId: string;
let serviceId: string;

describe('Quotation API - Integration Tests', () => {
  beforeAll(async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ritesh@gmail.com', password: '12345678' });
    
    const cookies = loginRes.headers['set-cookie'];
    authCookie = Array.isArray(cookies) ? cookies[0] : cookies;

    // Create customer for testing
    const custRes = await request(app)
      .post('/api/v1/customer')
      .set('Cookie', authCookie)
      .send({
        name: 'Quotation Test Customer',
        email: `quot-testq-${Date.now()}@test.com`,
        phone: '8580484591',
        notes: 'TEST_Quotation',
      });
    customerId = "cmrj0frih00006w7ok9fm4pp2";

    console.log('Customer create response:', custRes.status, custRes.body);

    // Create service for testing
    const svcRes = await request(app)
      .post('/api/v1/service')
      .set('Cookie', authCookie)
      .send({
        name: 'Quotation Test Service',
        price: 5000,
        description: 'TEST_Quotation',
      });
    serviceId = svcRes.body.data.id;
  });

  describe('POST /api/v1/quotation', () => {
    it('should create a quotation with items', async () => {
      const res = await request(app)
        .post('/api/v1/quotation')
        .set('Cookie', authCookie)
        .send({
          customerId,
          notes: 'TEST_Quotation',
          items: [
            {
              serviceId,
              quantity: 1,
              unitPrice: 5000,
              description: 'TEST_Quotation',
            },
          ],
        });

      quotationId = res.body.data.id;

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quotationNumber).toBeDefined();
      expect(res.body.data.status).toBe('DRAFT');
      expect(res.body.data.items).toHaveLength(1);
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .post('/api/v1/quotation')
        .send({ customerId, items: [{ serviceId, quantity: 1, unitPrice: 1000 }] });

      expect(res.status).toBe(401);
    });

    it('should reject missing customerId', async () => {
      const res = await request(app)
        .post('/api/v1/quotation')
        .set('Cookie', authCookie)
        .send({
          items: [{ serviceId, quantity: 1, unitPrice: 1000 }],
          notes: 'TEST_Quotation',
        });

      expect(res.status).toBe(400);
    });

    it('should reject empty items array', async () => {
      const res = await request(app)
        .post('/api/v1/quotation')
        .set('Cookie', authCookie)
        .send({
          customerId,
          items: [],
          notes: 'TEST_Quotation',
        });

      expect(res.status).toBe(400);
    });

    it('should reject missing items', async () => {
      const res = await request(app)
        .post('/api/v1/quotation')
        .set('Cookie', authCookie)
        .send({
          customerId,
          notes: 'TEST_Quotation',
        });

      expect(res.status).toBe(400);
    });

    it('should reject item with missing serviceId', async () => {
      const res = await request(app)
        .post('/api/v1/quotation')
        .set('Cookie', authCookie)
        .send({
          customerId,
          items: [{ quantity: 1, unitPrice: 1000 }],
          notes: 'TEST_Quotation',
        });

      expect(res.status).toBe(400);
    });

    it('should reject item with zero quantity', async () => {
      const res = await request(app)
        .post('/api/v1/quotation')
        .set('Cookie', authCookie)
        .send({
          customerId,
          items: [{ serviceId, quantity: 0, unitPrice: 1000 }],
          notes: 'TEST_Quotation',
        });

      expect(res.status).toBe(400);
    });

    it('should reject item with negative unit price', async () => {
      const res = await request(app)
        .post('/api/v1/quotation')
        .set('Cookie', authCookie)
        .send({
          customerId,
          items: [{ serviceId, quantity: 1, unitPrice: -100 }],
          notes: 'TEST_Quotation',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/quotation', () => {
    it('should get all quotations', async () => {
      const res = await request(app)
        .get('/api/v1/quotation')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/v1/quotation');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/quotation/:id', () => {
    it('should get quotation by id', async () => {
      const res = await request(app)
        .get(`/api/v1/quotation/${quotationId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(quotationId);
      expect(res.body.data.items).toBeDefined();
    });

    it('should return 404 for non-existent', async () => {
      const res = await request(app)
        .get('/api/v1/quotation/nonexistent123')
        .set('Cookie', authCookie);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/quotation/:id', () => {
    it('should update quotation notes', async () => {
      const res = await request(app)
        .put(`/api/v1/quotation/${quotationId}`)
        .set('Cookie', authCookie)
        .send({ notes: 'Updated notes' });

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toBe('Updated notes');
    });

    it('should return 404 for non-existent', async () => {
      const res = await request(app)
        .put('/api/v1/quotation/nonexistent123')
        .set('Cookie', authCookie)
        .send({ notes: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/quotation/:id/status', () => {
    it('should update status to SENT', async () => {
      const res = await request(app)
        .patch(`/api/v1/quotation/${quotationId}/status`)
        .set('Cookie', authCookie)
        .send({ status: 'SENT' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('SENT');
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .patch(`/api/v1/quotation/${quotationId}/status`)
        .set('Cookie', authCookie)
        .send({ status: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should reject missing status', async () => {
      const res = await request(app)
        .patch(`/api/v1/quotation/${quotationId}/status`)
        .set('Cookie', authCookie)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/quotation/:id', () => {
    it('should delete quotation', async () => {
      const res = await request(app)
        .delete(`/api/v1/quotation/${quotationId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent', async () => {
      const res = await request(app)
        .delete('/api/v1/quotation/nonexistent123')
        .set('Cookie', authCookie);

      expect(res.status).toBe(404);
    });
  });
});