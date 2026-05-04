import { HttpException, BadRequestException, NotFoundException } from '@nestjs/common';
import { GlobalExceptionFilter } from '../global-exception.filter';
import { AppError } from '../app-error';
import { ErrorLoggerService } from '../error-logger.service';
import { ErrorCatalogService } from '../error-catalog.service';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockLogger: ErrorLoggerService;
  let mockCatalog: ErrorCatalogService;

  const createMockHost = (headers: Record<string, string> = {}) => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = {
      url: '/api/v1/contacts/123',
      method: 'GET',
      requestId: 'test-trace-id',
      headers: { 'user-agent': 'test-agent', ...headers },
      user: { id: 'user-1', tenantId: 'tenant-1' },
      body: {},
      query: {},
      ip: '127.0.0.1',
    };

    return {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      mockResponse,
      mockRequest,
    };
  };

  beforeEach(() => {
    mockLogger = { log: jest.fn() } as any;
    mockCatalog = {
      cache: new Map(),
    } as any;
    filter = new GlobalExceptionFilter(mockLogger, mockCatalog);
  });

  describe('AppError handling', () => {
    it('should format AppError with code and suggestion', () => {
      const error = AppError.from('NOT_FOUND');
      const host = createMockHost();

      filter.catch(error, host as any);

      expect(host.mockResponse.status).toHaveBeenCalledWith(404);
      expect(host.mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 404,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
          }),
          requestId: 'test-trace-id',
        }),
      );
    });

    it('should include details from AppError.withDetails', () => {
      const error = AppError.from('VALIDATION_ERROR').withDetails([
        { field: 'email', message: 'Required' },
      ]);
      const host = createMockHost();

      filter.catch(error, host as any);

      expect(host.mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.arrayContaining([
              expect.objectContaining({ field: 'email' }),
            ]),
          }),
        }),
      );
    });
  });

  describe('HttpException handling', () => {
    it('should handle NotFoundException', () => {
      const host = createMockHost();
      filter.catch(new NotFoundException('Contact not found'), host as any);

      expect(host.mockResponse.status).toHaveBeenCalledWith(404);
      expect(host.mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
        }),
      );
    });

    it('should handle BadRequestException with validation errors', () => {
      const host = createMockHost();
      const error = new BadRequestException({
        message: ['email must be an email', 'name is required'],
      });

      filter.catch(error, host as any);

      expect(host.mockResponse.status).toHaveBeenCalledWith(400);
      expect(host.mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({ message: 'email must be an email' }),
            ]),
          }),
        }),
      );
    });
  });

  describe('Catalog enrichment', () => {
    it('should enrich response with Hindi messages from catalog', () => {
      (mockCatalog as any).cache = new Map([
        ['NOT_FOUND', {
          code: 'NOT_FOUND',
          layer: 'BE',
          module: 'SYSTEM',
          severity: 'WARNING',
          httpStatus: 404,
          messageEn: 'Resource not found',
          messageHi: 'संसाधन नहीं मिला',
          solutionEn: 'Verify the ID.',
          solutionHi: 'ID सत्यापित करें।',
          technicalInfo: null,
          helpUrl: '/help/errors/not-found',
          isRetryable: false,
          retryAfterMs: null,
        }],
      ]);

      const host = createMockHost();
      filter.catch(new NotFoundException(), host as any);

      expect(host.mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            messageHi: 'संसाधन नहीं मिला',
            suggestionHi: 'ID सत्यापित करें।',
            helpUrl: '/help/errors/not-found',
            isRetryable: false,
          }),
        }),
      );
    });

    it('should use Hindi message when Accept-Language includes hi', () => {
      (mockCatalog as any).cache = new Map([
        ['NOT_FOUND', {
          code: 'NOT_FOUND',
          layer: 'BE',
          module: 'SYSTEM',
          severity: 'WARNING',
          httpStatus: 404,
          messageEn: 'Resource not found',
          messageHi: 'संसाधन नहीं मिला',
          solutionEn: 'Verify the ID.',
          solutionHi: 'ID सत्यापित करें।',
          technicalInfo: null,
          helpUrl: null,
          isRetryable: false,
          retryAfterMs: null,
        }],
      ]);

      const host = createMockHost({ 'accept-language': 'hi-IN,hi;q=0.9,en;q=0.8' });
      filter.catch(new NotFoundException(), host as any);

      expect(host.mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'संसाधन नहीं मिला',
        }),
      );
    });

    it('should include isRetryable and retryAfterMs', () => {
      (mockCatalog as any).cache = new Map([
        ['AUTH_TOKEN_INVALID', {
          code: 'AUTH_TOKEN_INVALID',
          layer: 'BE',
          module: 'AUTH',
          severity: 'ERROR',
          httpStatus: 401,
          messageEn: 'Invalid token',
          messageHi: 'अमान्य टोकन',
          solutionEn: 'Re-login.',
          solutionHi: 'पुनः लॉगिन करें।',
          technicalInfo: null,
          helpUrl: null,
          isRetryable: true,
          retryAfterMs: 5000,
        }],
      ]);

      const host = createMockHost();
      filter.catch(new HttpException('Unauthorized', 401), host as any);

      expect(host.mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            isRetryable: true,
            retryAfterMs: 5000,
          }),
        }),
      );
    });
  });

  describe('Unknown errors', () => {
    it('should handle unknown errors with 500', () => {
      const host = createMockHost();
      filter.catch(new Error('Something broke'), host as any);

      expect(host.mockResponse.status).toHaveBeenCalledWith(500);
      expect(host.mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
          }),
        }),
      );
    });

    it('should handle non-Error objects', () => {
      const host = createMockHost();
      filter.catch('string error', host as any);

      expect(host.mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Error logging', () => {
    it('should call errorLogger.log with request context', () => {
      const host = createMockHost();
      filter.catch(new NotFoundException('Not found'), host as any);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'test-trace-id',
          errorCode: expect.any(String),
          statusCode: 404,
          path: '/api/v1/contacts/123',
          method: 'GET',
          userId: 'user-1',
          tenantId: 'tenant-1',
          module: 'contacts',
        }),
      );
    });

    it('should extract module from request path', () => {
      const host = createMockHost();
      (host.mockRequest as any).url = '/api/v1/marketplace/listings/123';

      filter.catch(new NotFoundException(), host as any);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'marketplace',
        }),
      );
    });
  });

  describe('traceId', () => {
    it('should use existing requestId as traceId', () => {
      const host = createMockHost();
      filter.catch(new NotFoundException(), host as any);

      expect(host.mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'test-trace-id',
        }),
      );
    });

    it('should generate UUID when no requestId', () => {
      const host = createMockHost();
      delete (host.mockRequest as any).requestId;

      filter.catch(new NotFoundException(), host as any);

      const response = host.mockResponse.json.mock.calls[0][0];
      expect(response.requestId).toBeDefined();
      expect(response.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });
});
