import { ResponseMapperInterceptor } from '../response/response-mapper.interceptor';
import { of } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Result } from '../result';

function createMockContext(method = 'GET', url = '/api/v1/test', statusCode = 200) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method, url, requestId: 'req_test123' }),
      getResponse: () => ({ statusCode, status: jest.fn() }),
    }),
  } as unknown as ExecutionContext;
}

function createMockHandler(data: any): CallHandler {
  return { handle: () => of(data) };
}

describe('ResponseMapperInterceptor', () => {
  const interceptor = new ResponseMapperInterceptor();

  it('should wrap raw data in standard format', (done) => {
    const ctx = createMockContext('GET', '/api/v1/leads');
    const handler = createMockHandler({ id: '1', name: 'Lead 1' });

    interceptor.intercept(ctx, handler).subscribe((result: any) => {
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Data fetched successfully');
      expect(result.data).toEqual({ id: '1', name: 'Lead 1' });
      expect(result.path).toBe('/api/v1/leads');
      expect(result.requestId).toBe('req_test123');
      expect(result.timestamp).toBeDefined();
      done();
    });
  });

  it('should handle builder result and fill extras', (done) => {
    const ctx = createMockContext('POST', '/api/v1/leads');
    const builderData = {
      __isBuilderResult: true,
      success: true,
      statusCode: 201,
      message: 'Lead created',
      data: { id: '1' },
    };
    const handler = createMockHandler(builderData);

    interceptor.intercept(ctx, handler).subscribe((result: any) => {
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Lead created');
      expect(result.data).toEqual({ id: '1' });
      done();
    });
  });

  it('should pass through already-formatted responses', (done) => {
    const ctx = createMockContext();
    const fullResponse = { __isApiResponse: true, custom: 'data' };
    const handler = createMockHandler(fullResponse);

    interceptor.intercept(ctx, handler).subscribe((result: any) => {
      expect(result.__isApiResponse).toBe(true);
      expect(result.custom).toBe('data');
      done();
    });
  });

  it('should use correct default messages per HTTP method', (done) => {
    const methods = {
      POST: 'Created successfully',
      PUT: 'Updated successfully',
      PATCH: 'Updated successfully',
      DELETE: 'Deleted successfully',
    };

    let completed = 0;
    for (const [method, expected] of Object.entries(methods)) {
      const ctx = createMockContext(method);
      const handler = createMockHandler({});

      interceptor.intercept(ctx, handler).subscribe((result: any) => {
        expect(result.message).toBe(expected);
        completed++;
        if (completed === Object.keys(methods).length) done();
      });
    }
  });

  it('should handle null data from controller', (done) => {
    const ctx = createMockContext('DELETE', '/api/v1/leads/1');
    const handler = createMockHandler(null);

    interceptor.intercept(ctx, handler).subscribe((result: any) => {
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      done();
    });
  });

  // ─── Result<T> support ──────────────────────────────

  it('should unwrap Result.ok() into standard success response', (done) => {
    const ctx = createMockContext('GET', '/api/v1/leads');
    const handler = createMockHandler(Result.ok({ id: '1', name: 'Lead' }));

    interceptor.intercept(ctx, handler).subscribe((result: any) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: '1', name: 'Lead' });
      expect(result.message).toBe('Data fetched successfully');
      done();
    });
  });

  it('should format Result.fail() as error response', (done) => {
    const ctx = createMockContext('GET', '/api/v1/leads/xyz');
    const handler = createMockHandler(Result.fail('LEAD_NOT_FOUND'));

    interceptor.intercept(ctx, handler).subscribe((result: any) => {
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error.code).toBe('LEAD_NOT_FOUND');
      expect(result.error.suggestion).toBeDefined();
      done();
    });
  });

  it('should handle __isResultError from toErrorResponse()', (done) => {
    const ctx = createMockContext('GET', '/api/v1/leads/xyz');
    const errorResp = Result.fail('CONTACT_NOT_FOUND').toErrorResponse();
    const handler = createMockHandler(errorResp);

    interceptor.intercept(ctx, handler).subscribe((result: any) => {
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error.code).toBe('CONTACT_NOT_FOUND');
      done();
    });
  });
});
