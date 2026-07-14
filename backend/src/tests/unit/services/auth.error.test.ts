import { describe, it, expect } from 'vitest';
import { authService } from '../../../modules/auth/auth.service';

describe('Auth Service - Error Handling', () => {
  describe('login', () => {
    it('should throw 401 with wrong password', async () => {
      try {
        await authService.login({ email: 'ritesh@gmail.com', password: 'wrongpassword' });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
      }
    });

    it('should throw 401 with non-existent email', async () => {
      try {
        await authService.login({ email: 'nonexist@test.com', password: 'password123' });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
      }
    });
  });
});