import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../app';

let authCookie: string;
let invoiceId: string;
const customerId = 'cmrj0frih00006w7ok9fm4pp2';
const serviceId = 'cmrj0x9tl0004kzfanekq0q8b';

describe('Invoice API - Integration Tests', () => {
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ritesh@gmail.com', password: '12345678' });
    
    const cookies = loginRes.headers['set-cookie'];
    authCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  describe('POST /api/v1/invoice', () => {
    it('should create an invoice with items', async () => {
      const res = await request(app)
        .post('/api/v1/invoice')
        .set('Cookie', authCookie)
        .send({
          customerId,
          notes: 'TEST_Invoice',
          items: [{ serviceId, quantity: 1, unitPrice: 1000, description: 'TEST_Invoice' }],
        });

      invoiceId = res.body.data.id;

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoiceNumber).toBeDefined();
      expect(res.body.data.status).toBe('DRAFT');
      expect(res.body.data.items).toHaveLength(1);
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .post('/api/v1/invoice')
        .send({ customerId, items: [{ serviceId, quantity: 1, unitPrice: 1000 }] });

      expect(res.status).toBe(401);
    });

    it('should reject missing customerId', async () => {
      const res = await request(app)
        .post('/api/v1/invoice')
        .set('Cookie', authCookie)
        .send({ items: [{ serviceId, quantity: 1, unitPrice: 1000 }], notes: 'TEST_Invoice' });

      expect(res.status).toBe(400);
    });

    it('should reject empty items', async () => {
      const res = await request(app)
        .post('/api/v1/invoice')
        .set('Cookie', authCookie)
        .send({ customerId, items: [], notes: 'TEST_Invoice' });

      expect(res.status).toBe(400);
    });

    it('should reject missing items', async () => {
      const res = await request(app)
        .post('/api/v1/invoice')
        .set('Cookie', authCookie)
        .send({ customerId, notes: 'TEST_Invoice' });

      expect(res.status).toBe(400);
    });

    it('should reject item missing serviceId', async () => {
      const res = await request(app)
        .post('/api/v1/invoice')
        .set('Cookie', authCookie)
        .send({ customerId, items: [{ quantity: 1, unitPrice: 1000 }], notes: 'TEST_Invoice' });

      expect(res.status).toBe(400);
    });

    it('should reject zero quantity', async () => {
      const res = await request(app)
        .post('/api/v1/invoice')
        .set('Cookie', authCookie)
        .send({ customerId, items: [{ serviceId, quantity: 0, unitPrice: 1000 }], notes: 'TEST_Invoice' });

      expect(res.status).toBe(400);
    });

    it('should reject negative unit price', async () => {
      const res = await request(app)
        .post('/api/v1/invoice')
        .set('Cookie', authCookie)
        .send({ customerId, items: [{ serviceId, quantity: 1, unitPrice: -100 }], notes: 'TEST_Invoice' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/invoice', () => {
    it('should get all invoices', async () => {
      const res = await request(app)
        .get('/api/v1/invoice')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/v1/invoice');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/invoice/:id', () => {
    it('should get invoice by id', async () => {
      const res = await request(app)
        .get(`/api/v1/invoice/${invoiceId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(invoiceId);
    });

    it('should return 404 for non-existent', async () => {
      const res = await request(app)
        .get('/api/v1/invoice/nonexistent123')
        .set('Cookie', authCookie);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/invoice/:id', () => {
    it('should update invoice', async () => {
      const res = await request(app)
        .put(`/api/v1/invoice/${invoiceId}`)
        .set('Cookie', authCookie)
        .send({ notes: 'Updated notes' });

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent', async () => {
      const res = await request(app)
        .put('/api/v1/invoice/nonexistent123')
        .set('Cookie', authCookie)
        .send({ notes: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/invoice/:id/status', () => {
    it('should update status to SENT', async () => {
      const res = await request(app)
        .patch(`/api/v1/invoice/${invoiceId}/status`)
        .set('Cookie', authCookie)
        .send({ status: 'SENT' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('SENT');
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .patch(`/api/v1/invoice/${invoiceId}/status`)
        .set('Cookie', authCookie)
        .send({ status: 'INVALID' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/invoice/:id', () => {
    it('should delete invoice', async () => {
      const res = await request(app)
        .delete(`/api/v1/invoice/${invoiceId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent', async () => {
      const res = await request(app)
        .delete('/api/v1/invoice/nonexistent123')
        .set('Cookie', authCookie);

      expect(res.status).toBe(404);
    });
  });
});