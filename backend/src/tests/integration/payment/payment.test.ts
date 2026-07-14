import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../app";

let authCookie: string;
let paymentId: string;
let invoiceId: string;
let customerId: string;
let serviceId: string;

describe("Payment API - Integration Tests", () => {
  beforeAll(async () => {
    // Login
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "ritesh@gmail.com", password: "12345678" });

    const cookies = loginRes.headers["set-cookie"];
    authCookie = Array.isArray(cookies) ? cookies[0] : cookies;

    // Create customer
    const custRes = await request(app)
      .post("/api/v1/customer")
      .set("Cookie", authCookie)
      .send({
        name: "Payment Test Customer",
        email: `pay-test-${Date.now()}@test.com`,
        phone: `9${Date.now().toString().slice(-9)}`,
        notes: "TEST_Payment",
      });
    customerId = custRes.body.data.id;

    // Create service
    const svcRes = await request(app)
      .post("/api/v1/service")
      .set("Cookie", authCookie)
      .send({
        name: "Payment Test Service",
        price: 1000,
        description: "TEST_Payment",
      });
    serviceId = svcRes.body.data.id;

    // Create invoice for payment test
    const invRes = await request(app)
      .post("/api/v1/invoice")
      .set("Cookie", authCookie)
      .send({
        customerId,
        notes: "TEST_Payment",
        items: [
          {
            serviceId,
            quantity: 1,
            unitPrice: 10000,
            description: "TEST_Payment",
          },
        ],
      });
    invoiceId = invRes.body.data.id;
  });

  describe("POST /api/v1/payment", () => {
    it("should create a payment", async () => {
      const res = await request(app)
        .post("/api/v1/payment")
        .set("Cookie", authCookie)
        .send({
          invoiceId,
          amount: 5000,
          paymentMethod: "BANK_TRANSFER",
          notes: "TEST_Payment",
        });

      paymentId = res.body.data.id;

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentNumber).toBeDefined();
      expect(res.body.data.status).toBe("COMPLETED");
      expect(res.body.data.amount).toBe("5000");
    });

    it("should reject without auth", async () => {
      const res = await request(app)
        .post("/api/v1/payment")
        .send({ invoiceId, amount: 1000, paymentMethod: "CASH" });

      expect(res.status).toBe(401);
    });

    it("should reject missing invoiceId", async () => {
      const res = await request(app)
        .post("/api/v1/payment")
        .set("Cookie", authCookie)
        .send({ amount: 1000, paymentMethod: "CASH" });

      expect(res.status).toBe(400);
    });

    it("should reject missing amount", async () => {
      const res = await request(app)
        .post("/api/v1/payment")
        .set("Cookie", authCookie)
        .send({ invoiceId, paymentMethod: "CASH" });

      expect(res.status).toBe(400);
    });

    it("should reject missing paymentMethod", async () => {
      const res = await request(app)
        .post("/api/v1/payment")
        .set("Cookie", authCookie)
        .send({ invoiceId, amount: 1000 });

      expect(res.status).toBe(400);
    });

    it("should reject invalid paymentMethod", async () => {
      const res = await request(app)
        .post("/api/v1/payment")
        .set("Cookie", authCookie)
        .send({ invoiceId, amount: 1000, paymentMethod: "INVALID" });

      expect(res.status).toBe(400);
    });

    it("should reject negative amount", async () => {
      const res = await request(app)
        .post("/api/v1/payment")
        .set("Cookie", authCookie)
        .send({ invoiceId, amount: -100, paymentMethod: "CASH" });

      expect(res.status).toBe(400);
    });

    it("should reject zero amount", async () => {
      const res = await request(app)
        .post("/api/v1/payment")
        .set("Cookie", authCookie)
        .send({ invoiceId, amount: 0, paymentMethod: "CASH" });

      expect(res.status).toBe(400);
    });

    it("should accept all payment methods", async () => {
      const methods = [
        "CASH",
        "BANK_TRANSFER",
        "UPI",
        "CREDIT_CARD",
        "DEBIT_CARD",
        "PAYPAL",
        "OTHER",
      ];

      for (const method of methods) {
        const res = await request(app)
          .post("/api/v1/payment")
          .set("Cookie", authCookie)
          .send({
            invoiceId,
            amount: 100,
            paymentMethod: method,
            notes: "TEST_Payment",
          });
        expect(res.status).toBe(201);
      }
    }, 60000); 
  });

  describe("GET /api/v1/payment", () => {
    it("should get all payments", async () => {
      const res = await request(app)
        .get("/api/v1/payment")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
    });

    it("should reject without auth", async () => {
      const res = await request(app).get("/api/v1/payment");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/payment/invoice/:invoiceId", () => {
    it("should get payments by invoice", async () => {
      const res = await request(app)
        .get(`/api/v1/payment/invoice/${invoiceId}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/payment/:id", () => {
    it("should get payment by id", async () => {
      const res = await request(app)
        .get(`/api/v1/payment/${paymentId}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(paymentId);
    });

    it("should return 404 for non-existent", async () => {
      const res = await request(app)
        .get("/api/v1/payment/nonexistent123")
        .set("Cookie", authCookie);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/v1/payment/:id", () => {
    it("should update payment", async () => {
      const res = await request(app)
        .put(`/api/v1/payment/${paymentId}`)
        .set("Cookie", authCookie)
        .send({ notes: "Updated notes" });

      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent", async () => {
      const res = await request(app)
        .put("/api/v1/payment/nonexistent123")
        .set("Cookie", authCookie)
        .send({ notes: "Test" });

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/payment/:id/status", () => {
    it("should update status to FAILED", async () => {
      const res = await request(app)
        .patch(`/api/v1/payment/${paymentId}/status`)
        .set("Cookie", authCookie)
        .send({ status: "FAILED" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("FAILED");
    });

    it("should reject invalid status", async () => {
      const res = await request(app)
        .patch(`/api/v1/payment/${paymentId}/status`)
        .set("Cookie", authCookie)
        .send({ status: "INVALID" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/payment/:id", () => {
    it("should delete payment", async () => {
      const res = await request(app)
        .delete(`/api/v1/payment/${paymentId}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent", async () => {
      const res = await request(app)
        .delete("/api/v1/payment/nonexistent123")
        .set("Cookie", authCookie);

      expect(res.status).toBe(404);
    });
  });
});
