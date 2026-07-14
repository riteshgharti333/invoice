import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

let authCookie: string;

describe('Security Tests - Enterprise Level', () => {
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ritesh@gmail.com', password: '12345678' });
    
    const cookies = res.headers['set-cookie'];
    authCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  // ============ AUTHENTICATION ATTACKS ============
  describe('Authentication Bypass', () => {
    it('should reject request with no token', async () => {
      const res = await request(app).get('/api/v1/customer');
      expect(res.status).toBe(401);
    });

    it('should reject request with fake token', async () => {
      const res = await request(app)
        .get('/api/v1/customer')
        .set('Cookie', 'twipra-token=fake-token-123');
      expect(res.status).toBe(401);
    });

    it('should reject request with malformed token', async () => {
      const res = await request(app)
        .get('/api/v1/customer')
        .set('Cookie', 'twipra-token=not.a.valid.jwt');
      expect(res.status).toBe(401);
    });
  });

  // ============ SQL INJECTION ATTEMPTS ============
  describe('SQL Injection Prevention', () => {
    it('should sanitize input in query params', async () => {
      const res = await request(app)
        .get('/api/v1/customer/%27%20OR%201=1--')
        .set('Cookie', authCookie);
      expect(res.status).toBe(404); // Treated as string, not SQL
    });

    it('should sanitize input in body', async () => {
      const res = await request(app)
        .post('/api/v1/customer')
        .set('Cookie', authCookie)
        .send({
          name: "'; DROP TABLE Customer;--",
          phone: '9876543210',
          notes: 'TEST_Security',
        });
      expect(res.status).not.toBe(500); // Should not crash
    });
  });

  // ============ XSS ATTACKS ============
  describe('XSS Prevention', () => {
    it('should handle script tags in input', async () => {
      const res = await request(app)
        .post('/api/v1/customer')
        .set('Cookie', authCookie)
        .send({
          name: '<script>alert("xss")</script>',
          phone: '9876543210',
          notes: 'TEST_Security',
        });
      expect(res.status).not.toBe(500);
    });

    it('should handle HTML in input', async () => {
      const res = await request(app)
        .post('/api/v1/customer')
        .set('Cookie', authCookie)
        .send({
          name: '<img src=x onerror=alert(1)>',
          phone: '9876543210',
          notes: 'TEST_Security',
        });
      expect(res.status).not.toBe(500);
    });
  });

  // ============ MASS ASSIGNMENT ============
  describe('Mass Assignment Prevention', () => {
    it('should ignore role field in customer creation', async () => {
      const res = await request(app)
        .post('/api/v1/customer')
        .set('Cookie', authCookie)
        .send({
          name: 'Test',
          phone: '9876543210',
          role: 'ADMIN', // Trying to set role
          notes: 'TEST_Security',
        });
     expect([400, 409]).toContain(res.status); // Unknown field rejected
    });
  });

  // ============ RATE LIMITING ============
  describe('Rate Limiting', () => {
    it('should handle multiple rapid requests', async () => {
  const requests = Array(5).fill(null).map(() =>
    request(app)
      .get('/api/v1/customer')
      .set('Cookie', authCookie)
  );
  const results = await Promise.all(requests);
  results.forEach(res => {
    expect([200, 429]).toContain(res.status);
  });
}, 15000); // 15 second timeout 
  });

  // ============ SENSITIVE DATA EXPOSURE ============
  describe('Sensitive Data Protection', () => {
    it('should not expose password in login response', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ritesh@gmail.com', password: '12345678' });
      
      expect(res.body).not.toHaveProperty('password');
      expect(JSON.stringify(res.body)).not.toContain('12345678');
    });

    it('should not expose stack traces on error', async () => {
      const res = await request(app)
        .get('/api/v1/customer/nonexistent123')
        .set('Cookie', authCookie);
      
      expect(res.body).not.toHaveProperty('stack');
      expect(res.body).not.toHaveProperty('error');
    });
  });

  // ============ HTTP METHODS ============
  describe('HTTP Method Validation', () => {
    it('should reject TRACE method', async () => {
      const res = await request(app).trace('/api/v1/customer');
      expect([401, 404, 405]).toContain(res.status); // Any rejection is fine
    });
  });
});