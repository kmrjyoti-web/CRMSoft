import { GlobalExceptionFilter } from '../errors/global-exception.filter';
import { AppError } from '../errors/app-error';
import { BadRequestException, NotFoundException, HttpException } from '@nestjs/common';

const mockErrorLogger = {
  log: jest.fn().mockResolvedValue(undefined),
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
    filter = new GlobalExceptionFilter(mockErrorLogger);
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

  it('should handle unknown errors as INTERNAL_ERROR', () => {
    const host = createMockHost();
    const error = new TypeError('Cannot read property of undefined');

    filter.catch(error, host);

    expect(host.status).toHaveBeenCalledWith(500);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      }),
    );
  });

  it('should include requestId, path, and timestamp in response', () => {
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

  it('should log error via ErrorLoggerService', () => {
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
      }),
    );
  });
});
