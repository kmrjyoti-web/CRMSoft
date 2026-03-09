import { GlobalExceptionFilter } from '../errors/global-exception.filter';
import { AppError } from '../errors/app-error';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockErrorLogger = {
  log: jest.fn(),
} as any;

const mockCatalog = {
  cache: new Map([
    ['LEAD_NOT_FOUND', {
      code: 'LEAD_NOT_FOUND',
      layer: 'BE',
      module: 'LEADS',
      severity: 'WARNING',
      httpStatus: 404,
      messageEn: 'Lead does not exist',
      messageHi: 'लीड मौजूद नहीं है',
      solutionEn: 'Verify the lead ID.',
      solutionHi: 'लीड ID सत्यापित करें।',
    }],
  ]),
} as any;

function createMockHost(url = '/api/v1/test') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        url,
        method: 'GET',
        requestId: 'req_test123',
        user: { id: 'user-1', tenantId: 'tenant-1' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      }),
      getResponse: () => ({ status }),
    }),
    json,
    status,
  } as any;
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new GlobalExceptionFilter(mockErrorLogger, mockCatalog);
  });

  it('should handle AppError with correct code and status', () => {
    const host = createMockHost();
    const error = AppError.from('LEAD_NOT_FOUND');

    filter.catch(error, host);

    expect(host.status).toHaveBeenCalledWith(404);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        error: expect.objectContaining({
          code: 'LEAD_NOT_FOUND',
        }),
      }),
    );
  });

  it('should handle AppError with details', () => {
    const host = createMockHost();
    const error = AppError.from('VALIDATION_ERROR').withDetails([
      { field: 'email', message: 'invalid' },
    ]);

    filter.catch(error, host);

    expect(host.status).toHaveBeenCalledWith(400);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: [{ field: 'email', message: 'invalid' }],
        }),
      }),
    );
  });

  it('should handle BadRequestException from ValidationPipe', () => {
    const host = createMockHost();
    const error = new BadRequestException({
      message: ['email must be valid', 'name should not be empty'],
    });

    filter.catch(error, host);

    expect(host.status).toHaveBeenCalledWith(400);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            expect.objectContaining({ message: 'email must be valid' }),
          ]),
        }),
      }),
    );
  });

  it('should handle generic HttpException (NotFoundException)', () => {
    const host = createMockHost();
    const error = new NotFoundException('Resource missing');

    filter.catch(error, host);

    expect(host.status).toHaveBeenCalledWith(404);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'NOT_FOUND' }),
      }),
    );
  });

  it('should handle unknown errors as INTERNAL_ERROR with CRITICAL severity', () => {
    const host = createMockHost();
    const error = new TypeError('Cannot read property of undefined');

    filter.catch(error, host);

    expect(host.status).toHaveBeenCalledWith(500);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      }),
    );
    expect(mockErrorLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'CRITICAL',
      }),
    );
  });

  it('should include requestId/traceId, path, and timestamp in response', () => {
    const host = createMockHost('/api/v1/leads/xyz');
    const error = AppError.from('NOT_FOUND');

    filter.catch(error, host);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req_test123',
        path: '/api/v1/leads/xyz',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should log error via ErrorLoggerService with layer and severity', () => {
    const host = createMockHost();
    const error = AppError.from('LEAD_NOT_FOUND');

    filter.catch(error, host);

    expect(mockErrorLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req_test123',
        errorCode: 'LEAD_NOT_FOUND',
        statusCode: 404,
        method: 'GET',
        userId: 'user-1',
        tenantId: 'tenant-1',
        layer: 'BE',
        severity: 'WARNING',
      }),
    );
  });

  it('should generate UUID traceId when requestId is missing', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          url: '/test',
          method: 'GET',
          headers: {},
        }),
        getResponse: () => ({ status }),
      }),
      json,
      status,
    } as any;

    filter.catch(new Error('test'), host);

    const response = json.mock.calls[0][0];
    expect(response.requestId).toBeDefined();
    expect(response.requestId).not.toBe('unknown');
  });

  it('should enrich response from ErrorCatalog when entry exists', () => {
    const host = createMockHost();
    // Add NOT_FOUND to mock catalog
    mockCatalog.cache.set('NOT_FOUND', {
      code: 'NOT_FOUND',
      layer: 'BE',
      module: 'SYSTEM',
      severity: 'WARNING',
      httpStatus: 404,
      messageEn: 'The requested resource was not found',
      messageHi: 'अनुरोधित संसाधन नहीं मिला',
      solutionEn: 'Verify the resource ID exists.',
      solutionHi: 'सत्यापित करें कि संसाधन ID मौजूद है।',
    });

    const error = new NotFoundException('Resource missing');
    filter.catch(error, host);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          suggestion: 'Verify the resource ID exists.',
        }),
      }),
    );
  });

  it('should work without ErrorCatalog (optional dependency)', () => {
    const filterNoCatalog = new GlobalExceptionFilter(mockErrorLogger);
    const host = createMockHost();
    const error = AppError.from('LEAD_NOT_FOUND');

    filterNoCatalog.catch(error, host);

    expect(host.status).toHaveBeenCalledWith(404);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'LEAD_NOT_FOUND' }),
      }),
    );
  });
});
