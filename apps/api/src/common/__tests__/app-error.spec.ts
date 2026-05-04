import { AppError } from '../errors/app-error';

describe('AppError', () => {
  it('should create error from known code', () => {
    const error = AppError.from('LEAD_NOT_FOUND');
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('LEAD_NOT_FOUND');
    expect(error.httpStatus).toBe(404);
    expect(error.message).toBe('Lead does not exist');
    expect(error.suggestion).toContain('Verify the lead ID');
  });

  it('should fallback to INTERNAL_ERROR for unknown code', () => {
    const error = AppError.from('TOTALLY_FAKE_CODE');
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.httpStatus).toBe(500);
  });

  it('should interpolate placeholders in message and suggestion', () => {
    const error = AppError.from('PLAN_LIMIT_REACHED', {
      current: 500,
      limit: 500,
    });
    expect(error.message).toContain('reached the limit');
    expect(error.suggestion).toContain('500/500');
  });

  it('should preserve unmatched placeholders', () => {
    const error = AppError.from('PERMISSION_DENIED', {});
    // {permission} not provided, should remain as-is
    expect(error.suggestion).toContain('{permission}');
  });

  it('should add details with withDetails()', () => {
    const fieldErrors = [
      { field: 'email', message: 'must be valid' },
    ];
    const error = AppError.from('VALIDATION_ERROR').withDetails(fieldErrors);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual(fieldErrors);
    expect(error.httpStatus).toBe(400);
  });

  it('should have null details by default', () => {
    const error = AppError.from('NOT_FOUND');
    expect(error.details).toBeNull();
  });
});
