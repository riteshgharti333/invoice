import { describe, it, expect } from "vitest";
import { createCustomerSchema, updateCustomerSchema } from "@invoice/shared";

describe("Customer Schema Validation - Enterprise Level", () => {
  describe("createCustomerSchema", () => {
    // ============ NAME FIELD ============
    it("should accept valid customer data", () => {
      const data = {
        body: { name: "John Doe", phone: "9876543210" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const data = { body: { phone: "9876543210" } };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject name shorter than 2 characters", () => {
      const data = {
        body: { name: "J", phone: "9876543210" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept name exactly 2 characters", () => {
      const data = {
        body: { name: "Jo", phone: "9876543210" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject name longer than 100 characters", () => {
      const data = {
        body: { name: "A".repeat(101), phone: "9876543210" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept name exactly 100 characters", () => {
      const data = {
        body: { name: "A".repeat(100), phone: "9876543210" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    // ============ PHONE FIELD ============
    it("should reject missing phone", () => {
      const data = { body: { name: "John" } };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject phone shorter than 10 characters", () => {
      const data = {
        body: { name: "John", phone: "123456789" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept phone exactly 10 characters", () => {
      const data = {
        body: { name: "John", phone: "1234567890" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject phone longer than 15 characters", () => {
      const data = {
        body: { name: "John", phone: "1234567890123456" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept phone exactly 15 characters", () => {
      const data = {
        body: { name: "John", phone: "123456789012345" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    // ============ EMAIL FIELD ============
    it("should accept valid email", () => {
      const data = {
        body: { name: "John", phone: "9876543210", email: "john@example.com" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const data = {
        body: { name: "John", phone: "9876543210", email: "not-email" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept empty string email", () => {
      const data = {
        body: { name: "John", phone: "9876543210", email: "" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept missing email (optional)", () => {
      const data = {
        body: { name: "John", phone: "9876543210" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    // ============ ADDRESS FIELD ============
    it("should accept valid address", () => {
      const data = {
        body: { name: "John", phone: "9876543210", address: "123 Main Street" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject address longer than 500 characters", () => {
      const data = {
        body: { name: "John", phone: "9876543210", address: "A".repeat(501) },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept address exactly 500 characters", () => {
      const data = {
        body: { name: "John", phone: "9876543210", address: "A".repeat(500) },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    // ============ GST NUMBER FIELD ============
    it("should accept valid GST number", () => {
      const data = {
        body: {
          name: "John",
          phone: "9876543210",
          gstNumber: "22AAAAA0000A1Z5",
        },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject GST number longer than 15 characters", () => {
      const data = {
        body: { name: "John", phone: "9876543210", gstNumber: "A".repeat(16) },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    // ============ NOTES FIELD ============
    it("should accept valid notes", () => {
      const data = {
        body: { name: "John", phone: "9876543210", notes: "Some notes here" },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject notes longer than 1000 characters", () => {
      const data = {
        body: { name: "John", phone: "9876543210", notes: "A".repeat(1001) },
      };
      const result = createCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    // ============ MISSING BODY ============
    it("should reject missing body", () => {
      const result = createCustomerSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("updateCustomerSchema", () => {
    it("should accept partial update with name only", () => {
      const data = { body: { name: "Updated Name" } };
      const result = updateCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept empty body", () => {
      const data = { body: {} };
      const result = updateCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept update with all fields", () => {
      const data = {
        body: {
          name: "Updated Name",
          phone: "9876543210",
          email: "updated@example.com",
          address: "New Address",
          gstNumber: "22BBBBB1111B2Z6",
          notes: "Updated notes",
          isActive: false,
        },
      };
      const result = updateCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email in update", () => {
      const data = { body: { email: "invalid" } };
      const result = updateCustomerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept nullable email", () => {
      const data = { body: { email: null } };
      const result = updateCustomerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
