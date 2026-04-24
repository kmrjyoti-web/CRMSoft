import { Result } from '../result/result';
import { AppError } from '../errors/app-error';

describe('Result<T>', () => {
  // ─── Factories ────────────────────────────────────────

  describe('ok()', () => {
    it('should create a success result', () => {
      const result = Result.ok({ id: '1', name: 'Test' });
      expect(result.isOk).toBe(true);
      expect(result.isFail).toBe(false);
      expect(result.value).toEqual({ id: '1', name: 'Test' });
    });

    it('should work with primitive values', () => {
      expect(Result.ok(42).value).toBe(42);
      expect(Result.ok('hello').value).toBe('hello');
      expect(Result.ok(true).value).toBe(true);
      expect(Result.ok(null).value).toBeNull();
    });
  });

  describe('fail()', () => {
    it('should create a failure result from error code', () => {
      const result = Result.fail('LEAD_NOT_FOUND');
      expect(result.isFail).toBe(true);
      expect(result.isOk).toBe(false);
      expect(result.error.code).toBe('LEAD_NOT_FOUND');
      expect(result.error.httpStatus).toBe(404);
    });

    it('should interpolate placeholders in message', () => {
      const result = Result.fail('PLAN_LIMIT_REACHED', {
        current: 500,
        limit: 500,
      });
      expect(result.error.message).toContain('reached the limit');
      expect(result.error.suggestion).toContain('500/500');
    });

    it('should fallback to INTERNAL_ERROR for unknown code', () => {
      const result = Result.fail('TOTALLY_FAKE_CODE');
      expect(result.error.code).toBe('INTERNAL_ERROR');
      expect(result.error.httpStatus).toBe(500);
    });
  });

  describe('failWithDetails()', () => {
    it('should create a failure with attached details', () => {
      const details = [{ field: 'email', message: 'invalid' }];
      const result = Result.failWithDetails('VALIDATION_ERROR', details);
      expect(result.isFail).toBe(true);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.details).toEqual(details);
    });
  });

  // ─── Accessors ────────────────────────────────────────

  describe('value accessor', () => {
    it('should throw when accessing value on failed result', () => {
      const result = Result.fail('NOT_FOUND');
      expect(() => result.value).toThrow('Cannot access value of a failed Result');
    });
  });

  describe('error accessor', () => {
    it('should throw when accessing error on success result', () => {
      const result = Result.ok('data');
      expect(() => result.error).toThrow('Cannot access error of a successful Result');
    });
  });

  // ─── Unwrap ───────────────────────────────────────────

  describe('unwrap()', () => {
    it('should return value on success', () => {
      const result = Result.ok({ id: '1' });
      expect(result.unwrap()).toEqual({ id: '1' });
    });

    it('should throw AppError on failure', () => {
      const result = Result.fail('LEAD_NOT_FOUND');
      try {
        result.unwrap();
        fail('Expected unwrap to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('LEAD_NOT_FOUND');
        expect((err as AppError).httpStatus).toBe(404);
      }
    });

    it('should throw AppError with details when failed with details', () => {
      const details = [{ field: 'email', message: 'invalid' }];
      const result = Result.failWithDetails('VALIDATION_ERROR', details);
      try {
        result.unwrap();
        fail('Expected unwrap to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).details).toEqual(details);
      }
    });
  });

  describe('unwrapOr()', () => {
    it('should return value on success', () => {
      expect(Result.ok(42).unwrapOr(0)).toBe(42);
    });

    it('should return default on failure', () => {
      expect(Result.fail<number>('NOT_FOUND').unwrapOr(0)).toBe(0);
    });
  });

  // ─── Transformers ─────────────────────────────────────

  describe('map()', () => {
    it('should transform value on success', () => {
      const result = Result.ok(5).map((v) => v * 2);
      expect(result.isOk).toBe(true);
      expect(result.value).toBe(10);
    });

    it('should propagate failure without calling fn', () => {
      const fn = jest.fn();
      const result = Result.fail<number>('NOT_FOUND').map(fn);
      expect(result.isFail).toBe(true);
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('flatMap()', () => {
    it('should chain with another Result-returning function', () => {
      const result = Result.ok(5).flatMap((v) =>
        v > 0 ? Result.ok(v * 2) : Result.fail('INVALID_INPUT'),
      );
      expect(result.isOk).toBe(true);
      expect(result.value).toBe(10);
    });

    it('should short-circuit on failure', () => {
      const fn = jest.fn();
      const result = Result.fail<number>('NOT_FOUND').flatMap(fn);
      expect(result.isFail).toBe(true);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should propagate failure from chained function', () => {
      const result = Result.ok(-1).flatMap((v) =>
        v > 0 ? Result.ok(v) : Result.fail('INVALID_INPUT'),
      );
      expect(result.isFail).toBe(true);
      expect(result.error.code).toBe('INVALID_INPUT');
    });
  });

  describe('withDetails()', () => {
    it('should add details to a failed result', () => {
      const result = Result.fail('VALIDATION_ERROR').withDetails({
        field: 'email',
      });
      expect(result.error.details).toEqual({ field: 'email' });
    });

    it('should be no-op on success', () => {
      const result = Result.ok('data').withDetails({ extra: true });
      expect(result.isOk).toBe(true);
      expect(result.value).toBe('data');
    });
  });

  // ─── toErrorResponse ─────────────────────────────────

  describe('toErrorResponse()', () => {
    it('should return error object for failed result', () => {
      const result = Result.fail('LEAD_NOT_FOUND');
      const resp = result.toErrorResponse();
      expect(resp).not.toBeNull();
      expect(resp!.__isResultError).toBe(true);
      expect(resp!.code).toBe('LEAD_NOT_FOUND');
      expect(resp!.httpStatus).toBe(404);
    });

    it('should return null for success result', () => {
      const result = Result.ok('data');
      expect(result.toErrorResponse()).toBeNull();
    });
  });

  // ─── Side effect callbacks ────────────────────────────

  describe('onOk()', () => {
    it('should call callback on success', () => {
      const fn = jest.fn();
      Result.ok('data').onOk(fn);
      expect(fn).toHaveBeenCalledWith('data');
    });

    it('should not call callback on failure', () => {
      const fn = jest.fn();
      Result.fail('NOT_FOUND').onOk(fn);
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('onFail()', () => {
    it('should call callback on failure', () => {
      const fn = jest.fn();
      Result.fail('NOT_FOUND').onFail(fn);
      expect(fn).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NOT_FOUND' }),
      );
    });

    it('should not call callback on success', () => {
      const fn = jest.fn();
      Result.ok('data').onFail(fn);
      expect(fn).not.toHaveBeenCalled();
    });
  });
});
