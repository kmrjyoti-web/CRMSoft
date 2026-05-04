import { AuditSanitizerService } from '../../services/audit-sanitizer.service';

describe('AuditSanitizerService', () => {
  let service: AuditSanitizerService;

  beforeEach(() => {
    service = new AuditSanitizerService();
  });

  it('should redact password field in request body', () => {
    const input = { email: 'test@test.com', password: 'secret123', firstName: 'John' };
    const result = service.sanitize(input);
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
    expect(result.firstName).toBe('John');
  });

  it('should redact nested sensitive fields (deep objects)', () => {
    const input = {
      user: { name: 'John', token: 'jwt-token-xyz', profile: { apiKey: 'key-123', age: 30 } },
      data: 'normal',
    };
    const result = service.sanitize(input);
    expect(result.user.token).toBe('[REDACTED]');
    expect(result.user.profile.apiKey).toBe('[REDACTED]');
    expect(result.user.name).toBe('John');
    expect(result.user.profile.age).toBe(30);
    expect(result.data).toBe('normal');
  });

  it('should preserve non-sensitive fields intact', () => {
    const input = { status: 'ACTIVE', firstName: 'John', lastName: 'Doe', priority: 'HIGH' };
    const result = service.sanitize(input);
    expect(result).toEqual(input);
  });

  it('should handle null/undefined input gracefully', () => {
    expect(service.sanitize(null)).toBeNull();
    expect(service.sanitize(undefined)).toBeUndefined();
    expect(service.sanitize('string')).toBe('string');
    expect(service.sanitize(42)).toBe(42);
  });
});
