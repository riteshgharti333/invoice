import { describe, it, expect } from 'vitest';
import {
  createQuotationSchema,
  updateQuotationSchema,
  updateQuotationStatusSchema,
} from '@invoice/shared';
import {
  validQuotation,
  validQuotationAllFields,
  invalidQuotations,
  boundaryQuotations,
  updateQuotations,
  updateStatus,
} from '../../fixtures/quotation.fixture';

describe('Quotation Schema Validation - Enterprise Level', () => {
  describe('createQuotationSchema', () => {
    // ============ HAPPY PATH ============
    it('should accept valid quotation with minimum fields', () => {
      const result = createQuotationSchema.safeParse(validQuotation);
      expect(result.success).toBe(true);
    });

    it('should accept valid quotation with all fields', () => {
      const result = createQuotationSchema.safeParse(validQuotationAllFields);
      expect(result.success).toBe(true);
    });

    // ============ CUSTOMER ID ============
    it('should reject missing customerId', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.missingCustomerId);
      expect(result.success).toBe(false);
    });

    // ============ ITEMS ARRAY ============
    it('should reject empty items array', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.emptyItems);
      expect(result.success).toBe(false);
    });

    it('should reject missing items', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.missingItems);
      expect(result.success).toBe(false);
    });

    it('should reject item with missing serviceId', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.missingServiceId);
      expect(result.success).toBe(false);
    });

    it('should reject item with zero quantity', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.zeroQuantity);
      expect(result.success).toBe(false);
    });

    it('should reject item with negative unit price', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.negativeUnitPrice);
      expect(result.success).toBe(false);
    });

    // ============ DISCOUNT ============
    it('should reject negative discount', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.negativeDiscount);
      expect(result.success).toBe(false);
    });

    it('should reject discount over 100', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.overMaxDiscount);
      expect(result.success).toBe(false);
    });

    it('should accept discount 0', () => {
      const result = createQuotationSchema.safeParse(boundaryQuotations.discountMin);
      expect(result.success).toBe(true);
    });

    it('should accept discount 100', () => {
      const result = createQuotationSchema.safeParse(boundaryQuotations.discountMax);
      expect(result.success).toBe(true);
    });

    // ============ TAX ============
    it('should reject negative tax', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.negativeTax);
      expect(result.success).toBe(false);
    });

    it('should reject tax over 100', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.overMaxTax);
      expect(result.success).toBe(false);
    });

    it('should accept tax 0', () => {
      const result = createQuotationSchema.safeParse(boundaryQuotations.taxMin);
      expect(result.success).toBe(true);
    });

    it('should accept tax 100', () => {
      const result = createQuotationSchema.safeParse(boundaryQuotations.taxMax);
      expect(result.success).toBe(true);
    });

    // ============ NOTES ============
    it('should reject notes longer than 1000 chars', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.longNotes);
      expect(result.success).toBe(false);
    });

    it('should accept notes exactly 1000 chars', () => {
      const result = createQuotationSchema.safeParse(boundaryQuotations.notesMax);
      expect(result.success).toBe(true);
    });

    // ============ TERMS ============
    it('should reject terms longer than 2000 chars', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.longTerms);
      expect(result.success).toBe(false);
    });

    it('should accept terms exactly 2000 chars', () => {
      const result = createQuotationSchema.safeParse(boundaryQuotations.termsMax);
      expect(result.success).toBe(true);
    });

    // ============ ITEM TAX RATE ============
    it('should reject item negative tax rate', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.itemNegativeTaxRate);
      expect(result.success).toBe(false);
    });

    it('should reject item tax rate over 100', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.itemOverMaxTaxRate);
      expect(result.success).toBe(false);
    });

    // ============ ITEM DISCOUNT ============
    it('should reject item negative discount', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.itemNegativeDiscount);
      expect(result.success).toBe(false);
    });

    it('should reject item discount over 100', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.itemOverMaxDiscount);
      expect(result.success).toBe(false);
    });

    // ============ BODY ============
    it('should reject missing body', () => {
      const result = createQuotationSchema.safeParse(invalidQuotations.missingBody);
      expect(result.success).toBe(false);
    });
  });

  describe('updateQuotationSchema', () => {
    it('should accept partial update', () => {
      const result = updateQuotationSchema.safeParse(updateQuotations.partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should accept empty body', () => {
      const result = updateQuotationSchema.safeParse(updateQuotations.emptyBody);
      expect(result.success).toBe(true);
    });

    it('should accept valid status update', () => {
      const result = updateQuotationSchema.safeParse(updateQuotations.statusUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateQuotationSchema.safeParse(updateQuotations.invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should accept nullable fields', () => {
      const result = updateQuotationSchema.safeParse(updateQuotations.nullableFields);
      expect(result.success).toBe(true);
    });
  });

  describe('updateQuotationStatusSchema', () => {
    it('should accept DRAFT status', () => {
      const result = updateQuotationStatusSchema.safeParse(updateStatus.validDraft);
      expect(result.success).toBe(true);
    });

    it('should accept SENT status', () => {
      const result = updateQuotationStatusSchema.safeParse(updateStatus.validSent);
      expect(result.success).toBe(true);
    });

    it('should accept APPROVED status', () => {
      const result = updateQuotationStatusSchema.safeParse(updateStatus.validApproved);
      expect(result.success).toBe(true);
    });

    it('should accept REJECTED status', () => {
      const result = updateQuotationStatusSchema.safeParse(updateStatus.validRejected);
      expect(result.success).toBe(true);
    });

    it('should accept EXPIRED status', () => {
      const result = updateQuotationStatusSchema.safeParse(updateStatus.validExpired);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateQuotationStatusSchema.safeParse(updateStatus.invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should reject missing status', () => {
      const result = updateQuotationStatusSchema.safeParse(updateStatus.missingStatus);
      expect(result.success).toBe(false);
    });
  });
});