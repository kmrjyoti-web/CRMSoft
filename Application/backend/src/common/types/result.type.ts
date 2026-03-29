/**
 * Re-export the canonical Result<T> class and its helpers.
 * Use Result.ok() / Result.fail() — see src/common/result/result.ts for full API.
 *
 * This module also exposes functional-style aliases for code that prefers them.
 */
export { Result } from '../result/result';
export { combine, fromAsync, fromNullable, ensure } from '../result/result.helpers';
export type { ResultError } from '../result/result.types';

/**
 * Functional-style type alias matching the prompt spec.
 * Prefer the class-based Result<T> for new code; this alias is provided
 * for compatibility with handlers that return plain discriminated unions.
 */
export type ResultType<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; statusCode?: number; details?: Record<string, unknown> } };

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  traceId?: string;
  statusCode?: number;
}

export const Ok = <T>(data: T): ResultType<T> => ({ success: true, data });

export const Err = (
  code: string,
  message: string,
  statusCode = 400,
  details?: Record<string, unknown>,
): ResultType<never> => ({
  success: false,
  error: { code, message, statusCode, details },
});

export const isOk = <T>(result: ResultType<T>): result is { success: true; data: T } =>
  result.success === true;

export const isErr = <T>(
  result: ResultType<T>,
): result is { success: false; error: AppError } => result.success === false;
