import { ErrorLoggerService } from '../errors/error-logger.service';

describe('ErrorLoggerService', () => {
  describe('sanitizeBody', () => {
    it('should redact sensitive fields', () => {
      const body = {
        email: 'test@test.com',
        password: 'secret123',
        name: 'John',
        apiKey: 'key_abc',
        accessToken: 'tok_xyz',
      };
      const sanitized = ErrorLoggerService.sanitizeBody(body);

      expect(sanitized.email).toBe('test@test.com');
      expect(sanitized.name).toBe('John');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.accessToken).toBe('[REDACTED]');
    });

    it('should handle null/undefined input', () => {
      expect(ErrorLoggerService.sanitizeBody(null)).toBeNull();
      expect(ErrorLoggerService.sanitizeBody(undefined)).toBeUndefined();
    });

    it('should handle non-object input', () => {
      expect(ErrorLoggerService.sanitizeBody('string')).toBe('string');
      expect(ErrorLoggerService.sanitizeBody(42)).toBe(42);
    });
  });

  describe('sanitizeHeaders', () => {
    it('should remove authorization and cookie headers', () => {
      const headers = {
        'content-type': 'application/json',
        authorization: 'Bearer token123',
        cookie: 'session=abc',
        'set-cookie': 'session=def',
        'user-agent': 'test',
      };
      const sanitized = ErrorLoggerService.sanitizeHeaders(headers);

      expect(sanitized['content-type']).toBe('application/json');
      expect(sanitized['user-agent']).toBe('test');
      expect(sanitized.authorization).toBeUndefined();
      expect(sanitized.cookie).toBeUndefined();
      expect(sanitized['set-cookie']).toBeUndefined();
    });

    it('should handle null/undefined headers', () => {
      expect(ErrorLoggerService.sanitizeHeaders(null as any)).toEqual({});
      expect(ErrorLoggerService.sanitizeHeaders(undefined as any)).toEqual({});
    });
  });

  describe('log', () => {
    it('should not throw when logging', () => {
      const mockPrisma = {
        errorLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      } as any;
      const service = new ErrorLoggerService(mockPrisma);

      expect(() =>
        service.log({
          requestId: 'req_1',
          errorCode: 'INTERNAL_ERROR',
          message: 'Test error',
          statusCode: 500,
          path: '/test',
          method: 'GET',
        }),
      ).not.toThrow();
    });
  });
});
