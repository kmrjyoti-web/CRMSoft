import { Test, TestingModule } from '@nestjs/testing';
import { ErrorLoggerService } from '../error-logger.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('ErrorLoggerService', () => {
  let service: ErrorLoggerService;

  const mockPrisma = {
    errorLog: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorLoggerService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(ErrorLoggerService);
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should persist 5xx errors to DB', async () => {
      service.log({
        requestId: 'trace-1',
        errorCode: 'INTERNAL_ERROR',
        message: 'Server error',
        statusCode: 500,
        path: '/api/v1/contacts',
        method: 'GET',
        layer: 'BE',
        severity: 'CRITICAL',
      });

      // Wait for async persist
      await new Promise((r) => setTimeout(r, 50));

      expect(mockPrisma.errorLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            requestId: 'trace-1',
            errorCode: 'INTERNAL_ERROR',
            statusCode: 500,
          }),
        }),
      );
    });

    it('should NOT persist 4xx errors by default', () => {
      service.log({
        requestId: 'trace-2',
        errorCode: 'VALIDATION_ERROR',
        message: 'Bad input',
        statusCode: 400,
        path: '/api/v1/contacts',
        method: 'POST',
      });

      expect(mockPrisma.errorLog.create).not.toHaveBeenCalled();
    });

    it('should persist special error codes regardless of status', async () => {
      service.log({
        requestId: 'trace-3',
        errorCode: 'AUTH_TOKEN_INVALID',
        message: 'Invalid token',
        statusCode: 401,
        path: '/api/v1/contacts',
        method: 'GET',
      });

      await new Promise((r) => setTimeout(r, 50));

      expect(mockPrisma.errorLog.create).toHaveBeenCalled();
    });

    it('should include module, requestBody, and metadata in persist', async () => {
      service.log({
        requestId: 'trace-4',
        errorCode: 'INTERNAL_ERROR',
        message: 'Error',
        statusCode: 500,
        path: '/api/v1/leads',
        method: 'POST',
        module: 'leads',
        requestBody: { name: 'test', password: 'secret123' },
        metadata: { source: 'api' },
      });

      await new Promise((r) => setTimeout(r, 50));

      expect(mockPrisma.errorLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            module: 'leads',
            requestBody: expect.objectContaining({
              name: 'test',
              password: '[REDACTED]',
            }),
            metadata: { source: 'api' },
          }),
        }),
      );
    });

    it('should not throw when DB persist fails', async () => {
      mockPrisma.errorLog.create.mockRejectedValue(new Error('DB down'));

      expect(() => {
        service.log({
          requestId: 'trace-5',
          errorCode: 'INTERNAL_ERROR',
          message: 'Error',
          statusCode: 500,
          path: '/',
          method: 'GET',
        });
      }).not.toThrow();
    });
  });

  describe('sanitizeBody', () => {
    it('should redact sensitive fields', () => {
      const sanitized = ErrorLoggerService.sanitizeBody({
        email: 'test@example.com',
        password: 'secret',
        token: 'abc123',
        apiKey: 'key123',
        name: 'John',
      });

      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.name).toBe('John');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
    });

    it('should handle null/undefined body', () => {
      expect(ErrorLoggerService.sanitizeBody(null)).toBeNull();
      expect(ErrorLoggerService.sanitizeBody(undefined)).toBeUndefined();
    });
  });

  describe('getByTraceId', () => {
    it('should query by requestId', async () => {
      mockPrisma.errorLog.findMany.mockResolvedValue([{ id: '1' }]);

      const result = await service.getByTraceId('trace-123');

      expect(mockPrisma.errorLog.findMany).toHaveBeenCalledWith({
        where: { requestId: 'trace-123' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getRecent', () => {
    it('should return paginated results', async () => {
      mockPrisma.errorLog.findMany.mockResolvedValue([]);
      mockPrisma.errorLog.count.mockResolvedValue(0);

      const result = await service.getRecent({ page: 1, limit: 20 });

      expect(result.data).toEqual([]);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should filter by tenantId and errorCode', async () => {
      mockPrisma.errorLog.findMany.mockResolvedValue([]);
      mockPrisma.errorLog.count.mockResolvedValue(0);

      await service.getRecent({
        tenantId: 'tenant-1',
        errorCode: 'NOT_FOUND',
      });

      expect(mockPrisma.errorLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            errorCode: 'NOT_FOUND',
          }),
        }),
      );
    });
  });

  describe('getStats', () => {
    it('should return grouped error stats', async () => {
      mockPrisma.errorLog.groupBy.mockResolvedValue([
        { errorCode: 'NOT_FOUND', _count: { id: 5 } },
        { errorCode: 'INTERNAL_ERROR', _count: { id: 3 } },
      ]);
      mockPrisma.errorLog.count.mockResolvedValue(8);

      const result = await service.getStats({});

      expect(result.total).toBe(8);
      expect(result.byCode).toHaveLength(2);
      expect(result.byCode[0].errorCode).toBe('NOT_FOUND');
      expect(result.byCode[0].count).toBe(5);
    });
  });

  describe('getBySeverity', () => {
    it('should query by severity and tenantId', async () => {
      mockPrisma.errorLog.findMany.mockResolvedValue([]);

      await service.getBySeverity('tenant-1', 'CRITICAL', 10);

      expect(mockPrisma.errorLog.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', severity: 'CRITICAL' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });
  });
});
