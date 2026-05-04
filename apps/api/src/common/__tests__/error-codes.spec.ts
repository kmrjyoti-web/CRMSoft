import { ERROR_CODES, TOTAL_ERROR_CODES } from '../errors/error-codes';

describe('ErrorCodes Registry', () => {
  it('should have at least 100 error codes defined', () => {
    expect(TOTAL_ERROR_CODES).toBeGreaterThanOrEqual(100);
  });

  it('should have unique codes matching their keys', () => {
    for (const [key, def] of Object.entries(ERROR_CODES)) {
      expect(def.code).toBe(key);
    }
  });

  it('should have valid HTTP status codes (100-599)', () => {
    for (const def of Object.values(ERROR_CODES)) {
      expect(def.httpStatus).toBeGreaterThanOrEqual(100);
      expect(def.httpStatus).toBeLessThanOrEqual(599);
    }
  });

  it('should have non-empty message and suggestion for every code', () => {
    for (const [key, def] of Object.entries(ERROR_CODES)) {
      expect(def.message.length).toBeGreaterThan(0);
      expect(def.suggestion.length).toBeGreaterThan(0);
    }
  });

  it('should contain all critical error codes', () => {
    const required = [
      'INTERNAL_ERROR', 'VALIDATION_ERROR', 'NOT_FOUND', 'DUPLICATE_ENTRY',
      'FORBIDDEN', 'AUTH_TOKEN_EXPIRED', 'LEAD_NOT_FOUND', 'CONTACT_NOT_FOUND',
      'ORGANIZATION_NOT_FOUND', 'QUOTATION_NOT_FOUND', 'PRODUCT_NOT_FOUND',
    ];
    for (const code of required) {
      expect(ERROR_CODES[code]).toBeDefined();
    }
  });
});
