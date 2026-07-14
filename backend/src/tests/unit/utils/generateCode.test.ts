import { describe, it, expect } from 'vitest';
import { generateCode } from '../../../common/utils/generateCode';

describe('generateCode', () => {
  it('should generate customer code', () => {
    const result = generateCode('CUS', 5);
    expect(result).toBe('CUS-2026-6');
  });

  it('should handle prefix longer than 3 chars', () => {
    const result = generateCode('CUSTOMER', 0);
    expect(result).toBe('CUS-2026-1');
  });

  it('should handle prefix shorter than 3 chars', () => {
    const result = generateCode('AB', 10);
    expect(result).toBe('AB-2026-11');
  });

  it('should handle count 0', () => {
    const result = generateCode('INV', 0);
    expect(result).toBe('INV-2026-1');
  });

  it('should uppercase prefix', () => {
    const result = generateCode('cus', 5);
    expect(result).toBe('CUS-2026-6');
  });
});