import { generateErrorReference } from '../errors/error-docs-generator';
import { TOTAL_ERROR_CODES } from '../errors/error-codes';

describe('ErrorDocsGenerator', () => {
  it('should generate a markdown string', () => {
    const doc = generateErrorReference();
    expect(typeof doc).toBe('string');
    expect(doc.length).toBeGreaterThan(1000);
  });

  it('should include header and total count', () => {
    const doc = generateErrorReference();
    expect(doc).toContain('# CRM API');
    expect(doc).toContain(`${TOTAL_ERROR_CODES}`);
  });

  it('should include error code tables with all codes', () => {
    const doc = generateErrorReference();
    expect(doc).toContain('LEAD_NOT_FOUND');
    expect(doc).toContain('VALIDATION_ERROR');
    expect(doc).toContain('AUTH_TOKEN_EXPIRED');
    expect(doc).toContain('INTERNAL_ERROR');
  });

  it('should include usage examples', () => {
    const doc = generateErrorReference();
    expect(doc).toContain('AppError.from');
    expect(doc).toContain('withDetails');
  });
});
