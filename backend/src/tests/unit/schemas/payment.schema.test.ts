import { describe, it, expect } from 'vitest';
import { createPaymentSchema, updatePaymentSchema, updatePaymentStatusSchema } from '@invoice/shared';
import { validPayment, validPaymentAllFields, invalidPayments, paymentMethods, updatePayments, updateStatus } from '../../fixtures/payment.fixture';

describe('Payment Schema Validation - Enterprise Level', () => {
  describe('createPaymentSchema', () => {
    it('should accept valid payment with minimum fields', () => {
      const result = createPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('should accept valid payment with all fields', () => {
      const result = createPaymentSchema.safeParse(validPaymentAllFields);
      expect(result.success).toBe(true);
    });

    it('should reject missing invoiceId', () => {
      const result = createPaymentSchema.safeParse(invalidPayments.missingInvoiceId);
      expect(result.success).toBe(false);
    });

    it('should reject missing amount', () => {
      const result = createPaymentSchema.safeParse(invalidPayments.missingAmount);
      expect(result.success).toBe(false);
    });

    it('should reject missing paymentMethod', () => {
      const result = createPaymentSchema.safeParse(invalidPayments.missingPaymentMethod);
      expect(result.success).toBe(false);
    });

    it('should reject missing body', () => {
      const result = createPaymentSchema.safeParse(invalidPayments.missingBody);
      expect(result.success).toBe(false);
    });

    it('should reject zero amount', () => {
      const result = createPaymentSchema.safeParse(invalidPayments.zeroAmount);
      expect(result.success).toBe(false);
    });

    it('should reject negative amount', () => {
      const result = createPaymentSchema.safeParse(invalidPayments.negativeAmount);
      expect(result.success).toBe(false);
    });

    it('should reject invalid payment method', () => {
      const result = createPaymentSchema.safeParse(invalidPayments.invalidPaymentMethod);
      expect(result.success).toBe(false);
    });

    it('should accept all valid payment methods', () => {
      expect(createPaymentSchema.safeParse(paymentMethods.cash).success).toBe(true);
      expect(createPaymentSchema.safeParse(paymentMethods.bankTransfer).success).toBe(true);
      expect(createPaymentSchema.safeParse(paymentMethods.upi).success).toBe(true);
      expect(createPaymentSchema.safeParse(paymentMethods.creditCard).success).toBe(true);
      expect(createPaymentSchema.safeParse(paymentMethods.debitCard).success).toBe(true);
      expect(createPaymentSchema.safeParse(paymentMethods.paypal).success).toBe(true);
      expect(createPaymentSchema.safeParse(paymentMethods.other).success).toBe(true);
    });

    it('should reject long transaction number', () => {
      const result = createPaymentSchema.safeParse(invalidPayments.longTransactionNumber);
      expect(result.success).toBe(false);
    });

    it('should reject long notes', () => {
      const result = createPaymentSchema.safeParse(invalidPayments.longNotes);
      expect(result.success).toBe(false);
    });
  });

  describe('updatePaymentSchema', () => {
    it('should accept partial update', () => {
      const result = updatePaymentSchema.safeParse(updatePayments.partial);
      expect(result.success).toBe(true);
    });

    it('should accept empty body', () => {
      const result = updatePaymentSchema.safeParse(updatePayments.emptyBody);
      expect(result.success).toBe(true);
    });

    it('should accept valid status update', () => {
      const result = updatePaymentSchema.safeParse(updatePayments.statusUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updatePaymentSchema.safeParse(updatePayments.invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should accept nullable fields', () => {
      const result = updatePaymentSchema.safeParse(updatePayments.nullableFields);
      expect(result.success).toBe(true);
    });
  });

  describe('updatePaymentStatusSchema', () => {
    it('should accept all valid statuses', () => {
      expect(updatePaymentStatusSchema.safeParse(updateStatus.validPending).success).toBe(true);
      expect(updatePaymentStatusSchema.safeParse(updateStatus.validCompleted).success).toBe(true);
      expect(updatePaymentStatusSchema.safeParse(updateStatus.validFailed).success).toBe(true);
      expect(updatePaymentStatusSchema.safeParse(updateStatus.validRefunded).success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updatePaymentStatusSchema.safeParse(updateStatus.invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should reject missing status', () => {
      const result = updatePaymentStatusSchema.safeParse(updateStatus.missingStatus);
      expect(result.success).toBe(false);
    });
  });
});