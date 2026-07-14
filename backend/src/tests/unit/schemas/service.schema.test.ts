import { describe, it, expect } from 'vitest';
import { createServiceSchema, updateServiceSchema } from '@invoice/shared';
import {
  validService,
  validServiceAllFields,
  invalidServices,
  boundaryServices,
  updateServices,
} from '../../fixtures/service.fixture';

describe('Service Schema Validation - Enterprise Level', () => {
  describe('createServiceSchema', () => {
    // ============ HAPPY PATH ============
    it('should accept valid service with required fields', () => {
      const result = createServiceSchema.safeParse(validService);
      expect(result.success).toBe(true);
    });

    it('should accept valid service with all fields', () => {
      const result = createServiceSchema.safeParse(validServiceAllFields);
      expect(result.success).toBe(true);
    });

    // ============ NAME FIELD ============
    it('should reject missing name', () => {
      const result = createServiceSchema.safeParse(invalidServices.missingName);
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = createServiceSchema.safeParse(invalidServices.shortName);
      expect(result.success).toBe(false);
    });

    it('should accept name exactly 2 characters', () => {
      const result = createServiceSchema.safeParse(boundaryServices.nameMin);
      expect(result.success).toBe(true);
    });

    it('should reject name longer than 200 characters', () => {
      const result = createServiceSchema.safeParse(invalidServices.longName);
      expect(result.success).toBe(false);
    });

    it('should accept name exactly 200 characters', () => {
      const result = createServiceSchema.safeParse(boundaryServices.nameMax);
      expect(result.success).toBe(true);
    });

    // ============ PRICE FIELD ============
    it('should reject missing price', () => {
      const result = createServiceSchema.safeParse(invalidServices.missingPrice);
      expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
      const result = createServiceSchema.safeParse(invalidServices.zeroPrice);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = createServiceSchema.safeParse(invalidServices.negativePrice);
      expect(result.success).toBe(false);
    });

    it('should accept decimal price', () => {
      const result = createServiceSchema.safeParse(boundaryServices.priceDecimal);
      expect(result.success).toBe(true);
    });

    // ============ TAX RATE ============
    it('should accept tax rate 0', () => {
      const result = createServiceSchema.safeParse(boundaryServices.taxRateMin);
      expect(result.success).toBe(true);
    });

    it('should accept tax rate 100', () => {
      const result = createServiceSchema.safeParse(boundaryServices.taxRateMax);
      expect(result.success).toBe(true);
    });

    it('should reject negative tax rate', () => {
      const result = createServiceSchema.safeParse(invalidServices.negativeTaxRate);
      expect(result.success).toBe(false);
    });

    it('should reject tax rate over 100', () => {
      const result = createServiceSchema.safeParse(invalidServices.overMaxTaxRate);
      expect(result.success).toBe(false);
    });

    // ============ DESCRIPTION ============
    it('should reject description longer than 1000 characters', () => {
      const result = createServiceSchema.safeParse(invalidServices.longDescription);
      expect(result.success).toBe(false);
    });

    // ============ UNIT ============
    it('should reject unit longer than 50 characters', () => {
      const result = createServiceSchema.safeParse(invalidServices.longUnit);
      expect(result.success).toBe(false);
    });

    // ============ BODY ============
    it('should reject missing body', () => {
      const result = createServiceSchema.safeParse(invalidServices.missingBody);
      expect(result.success).toBe(false);
    });
  });

  describe('updateServiceSchema', () => {
    it('should accept partial update with name only', () => {
      const result = updateServiceSchema.safeParse(updateServices.partialName);
      expect(result.success).toBe(true);
    });

    it('should accept empty body', () => {
      const result = updateServiceSchema.safeParse(updateServices.emptyBody);
      expect(result.success).toBe(true);
    });

    it('should accept nullable description', () => {
      const result = updateServiceSchema.safeParse(updateServices.nullableDescription);
      expect(result.success).toBe(true);
    });

    it('should accept nullable categoryId', () => {
      const result = updateServiceSchema.safeParse(updateServices.nullableCategoryId);
      expect(result.success).toBe(true);
    });

    it('should accept update with all fields', () => {
      const result = updateServiceSchema.safeParse(updateServices.allFields);
      expect(result.success).toBe(true);
    });

    it('should reject invalid price in update', () => {
      const result = updateServiceSchema.safeParse(updateServices.invalidPrice);
      expect(result.success).toBe(false);
    });
  });
});