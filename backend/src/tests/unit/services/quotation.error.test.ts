import { describe, it, expect } from 'vitest';
import { quotationService } from '../../../modules/quotation/quotation.service';

describe('Quotation Service - Error Handling', () => {
  describe('createQuotation', () => {
    it('should throw error when items array is empty', async () => {
      try {
        await quotationService.createQuotation({
          customerId: 'test123',
          items: [],
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('At least one item is required');
      }
    });

    it('should throw error when items is undefined', async () => {
      try {
        await quotationService.createQuotation({
          customerId: 'test123',
          items: undefined as any,
        });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe('getQuotationById', () => {
    it('should throw 404 when quotation not found', async () => {
      try {
        await quotationService.getQuotationById('nonexistent-id-12345');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Quotation not found');
      }
    });
  });

  describe('updateQuotation', () => {
    it('should throw 404 when updating non-existent quotation', async () => {
      try {
        await quotationService.updateQuotation('nonexistent-id', { notes: 'test' });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Quotation not found');
      }
    });
  });

  describe('deleteQuotation', () => {
    it('should throw 404 when deleting non-existent quotation', async () => {
      try {
        await quotationService.deleteQuotation('nonexistent-id');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Quotation not found');
      }
    });
  });

  describe('updateStatus', () => {
    it('should throw 404 for non-existent quotation', async () => {
      try {
        await quotationService.updateStatus('nonexistent-id', 'SENT');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Quotation not found');
      }
    });
  });
});