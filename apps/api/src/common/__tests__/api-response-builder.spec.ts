import { ApiResponseBuilder } from '../response/api-response.builder';

describe('ApiResponseBuilder', () => {
  it('should build a success response', () => {
    const result = ApiResponseBuilder.success({ id: '1', name: 'Test' })
      .message('Lead fetched')
      .build();

    expect(result.__isBuilderResult).toBe(true);
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.message).toBe('Lead fetched');
    expect(result.data).toEqual({ id: '1', name: 'Test' });
  });

  it('should build a created response with 201', () => {
    const result = ApiResponseBuilder.created({ id: '1' }).build();
    expect(result.statusCode).toBe(201);
    expect(result.message).toBe('Created successfully');
  });

  it('should build a no-content response with 204', () => {
    const result = ApiResponseBuilder.noContent().build();
    expect(result.statusCode).toBe(204);
    expect(result.data).toBeNull();
  });

  it('should build a paginated response with meta', () => {
    const meta = {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
      hasNext: true,
      hasPrevious: false,
    };
    const result = ApiResponseBuilder.paginated([{ id: '1' }], meta).build();

    expect(result.data).toEqual([{ id: '1' }]);
    expect(result.meta).toEqual(meta);
    expect(result.statusCode).toBe(200);
  });

  it('should allow overriding statusCode', () => {
    const result = ApiResponseBuilder.success(null).statusCode(202).build();
    expect(result.statusCode).toBe(202);
  });
});
