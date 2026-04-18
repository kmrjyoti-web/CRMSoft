import { Result } from './result';

/**
 * Combine multiple Results — returns ok with array of values if ALL succeed,
 * or the first failure encountered.
 *
 * Usage:
 *   const [contact, org] = Result.combine([
 *     contactResult,
 *     orgResult,
 *   ]).unwrap();
 */
export function combine<T extends readonly Result<any>[]>(
  results: [...T],
): Result<{ [K in keyof T]: T[K] extends Result<infer U> ? U : never }> {
  const values: any[] = [];
  for (const result of results) {
    if (result.isFail) {
      return Result.fail(result.error.code, result.error.interpolated);
    }
    values.push(result.value);
  }
  return Result.ok(values as any);
}

/**
 * Wrap an async operation (typically Prisma) in a Result.
 * Returns Result.ok(value) on success, Result.fail('INTERNAL_ERROR') on throw.
 *
 * Usage:
 *   const result = await fromAsync(() => prisma.lead.create({ data }));
 */
export async function fromAsync<T>(
  fn: () => Promise<T>,
  failCode = 'OPERATION_FAILED',
): Promise<Result<T>> {
  try {
    const value = await fn();
    return Result.ok(value);
  } catch {
    return Result.fail(failCode);
  }
}

/**
 * Convert a nullable value to a Result.
 * Returns Result.ok(value) if non-null, Result.fail(code) if null/undefined.
 *
 * Usage:
 *   const result = fromNullable(lead, 'LEAD_NOT_FOUND');
 */
export function fromNullable<T>(
  value: T | null | undefined,
  failCode: string,
  interpolations?: Record<string, any>,
): Result<T> {
  if (value === null || value === undefined) {
    return Result.fail(failCode, interpolations);
  }
  return Result.ok(value);
}

/**
 * Wrap a value in Result.ok only if the predicate passes.
 * Otherwise returns Result.fail(code).
 *
 * Usage:
 *   const result = ensure(lead, (l) => l.status !== 'WON', 'LEAD_ALREADY_WON');
 */
export function ensure<T>(
  value: T,
  predicate: (value: T) => boolean,
  failCode: string,
  interpolations?: Record<string, any>,
): Result<T> {
  if (predicate(value)) {
    return Result.ok(value);
  }
  return Result.fail(failCode, interpolations);
}
