import { describe, it, expect } from 'vitest';
import { createInvoiceSchema, updateInvoiceSchema, updateInvoiceStatusSchema } from '@invoice/shared';
import { validInvoice, validInvoiceAllFields, invalidInvoices, boundaryInvoices, updateInvoices, updateStatus } from '../../fixtures/invoice.fixture';

describe('Invoice Schema Validation - Enterprise Level', () => {
  describe('createInvoiceSchema', () => {
    it('should accept valid invoice with minimum fields', () => {
      const result = createInvoiceSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
    });

    it('should accept valid invoice with all fields', () => {
      const result = createInvoiceSchema.safeParse(validInvoiceAllFields);
      expect(result.success).toBe(true);
    });

    it('should reject missing customerId', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.missingCustomerId);
      expect(result.success).toBe(false);
    });

    it('should reject empty items array', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.emptyItems);
      expect(result.success).toBe(false);
    });

    it('should reject missing items', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.missingItems);
      expect(result.success).toBe(false);
    });

    it('should reject missing body', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.missingBody);
      expect(result.success).toBe(false);
    });

    it('should reject item with missing serviceId', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.missingServiceId);
      expect(result.success).toBe(false);
    });

    it('should reject zero quantity', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.zeroQuantity);
      expect(result.success).toBe(false);
    });

    it('should reject negative unit price', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.negativeUnitPrice);
      expect(result.success).toBe(false);
    });

    it('should reject negative discount', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.negativeDiscount);
      expect(result.success).toBe(false);
    });

    it('should reject discount over 100', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.overMaxDiscount);
      expect(result.success).toBe(false);
    });

    it('should accept discount 0 and 100', () => {
      expect(createInvoiceSchema.safeParse(boundaryInvoices.discountMin).success).toBe(true);
      expect(createInvoiceSchema.safeParse(boundaryInvoices.discountMax).success).toBe(true);
    });

    it('should reject negative tax', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.negativeTax);
      expect(result.success).toBe(false);
    });

    it('should reject tax over 100', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.overMaxTax);
      expect(result.success).toBe(false);
    });

    it('should accept tax 0 and 100', () => {
      expect(createInvoiceSchema.safeParse(boundaryInvoices.taxMin).success).toBe(true);
      expect(createInvoiceSchema.safeParse(boundaryInvoices.taxMax).success).toBe(true);
    });

    it('should reject notes > 1000 chars', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.longNotes);
      expect(result.success).toBe(false);
    });

    it('should accept notes = 1000 chars', () => {
      const result = createInvoiceSchema.safeParse(boundaryInvoices.notesMax);
      expect(result.success).toBe(true);
    });

    it('should reject terms > 2000 chars', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.longTerms);
      expect(result.success).toBe(false);
    });

    it('should accept terms = 2000 chars', () => {
      const result = createInvoiceSchema.safeParse(boundaryInvoices.termsMax);
      expect(result.success).toBe(true);
    });

    it('should reject item negative tax rate', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.itemNegativeTaxRate);
      expect(result.success).toBe(false);
    });

    it('should reject item tax rate > 100', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.itemOverMaxTaxRate);
      expect(result.success).toBe(false);
    });

    it('should reject item negative discount', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.itemNegativeDiscount);
      expect(result.success).toBe(false);
    });

    it('should reject item discount > 100', () => {
      const result = createInvoiceSchema.safeParse(invalidInvoices.itemOverMaxDiscount);
      expect(result.success).toBe(false);
    });
  });

  describe('updateInvoiceSchema', () => {
    it('should accept partial update', () => {
      const result = updateInvoiceSchema.safeParse(updateInvoices.partial);
      expect(result.success).toBe(true);
    });

    it('should accept empty body', () => {
      const result = updateInvoiceSchema.safeParse(updateInvoices.emptyBody);
      expect(result.success).toBe(true);
    });

    it('should accept valid status update', () => {
      const result = updateInvoiceSchema.safeParse(updateInvoices.statusUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateInvoiceSchema.safeParse(updateInvoices.invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should accept nullable fields', () => {
      const result = updateInvoiceSchema.safeParse(updateInvoices.nullableFields);
      expect(result.success).toBe(true);
    });
  });

  describe('updateInvoiceStatusSchema', () => {
    it('should accept all valid statuses', () => {
      expect(updateInvoiceStatusSchema.safeParse(updateStatus.validDraft).success).toBe(true);
      expect(updateInvoiceStatusSchema.safeParse(updateStatus.validSent).success).toBe(true);
      expect(updateInvoiceStatusSchema.safeParse(updateStatus.validPartiallyPaid).success).toBe(true);
      expect(updateInvoiceStatusSchema.safeParse(updateStatus.validPaid).success).toBe(true);
      expect(updateInvoiceStatusSchema.safeParse(updateStatus.validOverdue).success).toBe(true);
      expect(updateInvoiceStatusSchema.safeParse(updateStatus.validCancelled).success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateInvoiceStatusSchema.safeParse(updateStatus.invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should reject missing status', () => {
      const result = updateInvoiceStatusSchema.safeParse(updateStatus.missingStatus);
      expect(result.success).toBe(false);
    });
  });
});