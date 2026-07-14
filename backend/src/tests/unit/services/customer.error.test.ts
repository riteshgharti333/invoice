import { describe, it, expect } from 'vitest';
import { customerService } from '../../../modules/customer/customer.service';

describe('Customer Service - Error Handling', () => {
  describe('getCustomerById', () => {
    it('should throw 404 when customer not found', async () => {
      try {
        await customerService.getCustomerById('nonexistent-id');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Customer not found');
      }
    });
  });

  describe('deleteCustomer', () => {
    it('should throw 404 when deleting non-existent customer', async () => {
      try {
        await customerService.deleteCustomer('nonexistent-id');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Customer not found');
      }
    });
  });
});