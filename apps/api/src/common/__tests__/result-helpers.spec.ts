import { Result } from '../result/result';
import { combine, fromAsync, fromNullable, ensure } from '../result/result.helpers';

describe('Result Helpers', () => {
  // ─── combine ──────────────────────────────────────────

  describe('combine()', () => {
    it('should return ok with all values when all succeed', () => {
      const r1 = Result.ok('a');
      const r2 = Result.ok(42);
      const r3 = Result.ok(true);

      const combined = combine([r1, r2, r3]);
      expect(combined.isOk).toBe(true);
      expect(combined.value).toEqual(['a', 42, true]);
    });

    it('should return first failure when any result fails', () => {
      const r1 = Result.ok('a');
      const r2 = Result.fail('LEAD_NOT_FOUND');
      const r3 = Result.ok(true);

      const combined = combine([r1, r2, r3]);
      expect(combined.isFail).toBe(true);
      expect(combined.error.code).toBe('LEAD_NOT_FOUND');
    });

    it('should work with empty array', () => {
      const combined = combine([]);
      expect(combined.isOk).toBe(true);
      expect(combined.value).toEqual([]);
    });
  });

  // ─── fromAsync ────────────────────────────────────────

  describe('fromAsync()', () => {
    it('should return ok when async function succeeds', async () => {
      const result = await fromAsync(() => Promise.resolve({ id: '1' }));
      expect(result.isOk).toBe(true);
      expect(result.value).toEqual({ id: '1' });
    });

    it('should return fail when async function throws', async () => {
      const result = await fromAsync(() => Promise.reject(new Error('DB error')));
      expect(result.isFail).toBe(true);
      expect(result.error.code).toBe('OPERATION_FAILED');
    });

    it('should use custom fail code', async () => {
      const result = await fromAsync(
        () => Promise.reject(new Error('oops')),
        'LEAD_NOT_FOUND',
      );
      expect(result.isFail).toBe(true);
      expect(result.error.code).toBe('LEAD_NOT_FOUND');
    });
  });

  // ─── fromNullable ─────────────────────────────────────

  describe('fromNullable()', () => {
    it('should return ok for non-null value', () => {
      const result = fromNullable({ id: '1' }, 'NOT_FOUND');
      expect(result.isOk).toBe(true);
      expect(result.value).toEqual({ id: '1' });
    });

    it('should return fail for null', () => {
      const result = fromNullable(null, 'LEAD_NOT_FOUND');
      expect(result.isFail).toBe(true);
      expect(result.error.code).toBe('LEAD_NOT_FOUND');
    });

    it('should return fail for undefined', () => {
      const result = fromNullable(undefined, 'CONTACT_NOT_FOUND');
      expect(result.isFail).toBe(true);
      expect(result.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return ok for falsy but non-null values', () => {
      expect(fromNullable(0, 'NOT_FOUND').isOk).toBe(true);
      expect(fromNullable('', 'NOT_FOUND').isOk).toBe(true);
      expect(fromNullable(false, 'NOT_FOUND').isOk).toBe(true);
    });

    it('should support interpolations on fail', () => {
      const result = fromNullable(null, 'PERMISSION_DENIED', {
        permission: 'leads:write',
      });
      expect(result.error.suggestion).toContain('leads:write');
    });
  });

  // ─── ensure ───────────────────────────────────────────

  describe('ensure()', () => {
    it('should return ok when predicate passes', () => {
      const result = ensure(42, (v) => v > 0, 'INVALID_INPUT');
      expect(result.isOk).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should return fail when predicate fails', () => {
      const result = ensure(-1, (v) => v > 0, 'INVALID_INPUT');
      expect(result.isFail).toBe(true);
      expect(result.error.code).toBe('INVALID_INPUT');
    });

    it('should support complex predicates', () => {
      const lead = { status: 'WON', id: '1' };
      const result = ensure(lead, (l) => l.status !== 'WON', 'LEAD_ALREADY_WON');
      expect(result.isFail).toBe(true);
      expect(result.error.code).toBe('LEAD_ALREADY_WON');
    });

    it('should support interpolations on fail', () => {
      const result = ensure(
        { status: 'NEW' },
        (l) => l.status === 'IN_PROGRESS',
        'LEAD_STATUS_INVALID_TRANSITION',
        { from: 'NEW', to: 'WON', validTransitions: 'VERIFIED' },
      );
      expect(result.error.message).toContain('NEW');
      expect(result.error.message).toContain('WON');
    });
  });
});
