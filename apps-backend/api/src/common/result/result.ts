import { ERROR_CODES } from '../errors/error-codes';
import { AppError } from '../errors/app-error';
import { ResultError } from './result.types';

/**
 * Monadic Result<T> — services return this instead of throwing.
 *
 * Usage:
 *   // In service
 *   const lead = await prisma.lead.findFirst({ ... });
 *   if (!lead) return Result.fail('LEAD_NOT_FOUND');
 *   return Result.ok(lead);
 *
 *   // In controller
 *   const result = await this.service.findOne(id);
 *   return result.unwrap(); // throws AppError if failed — caught by GlobalExceptionFilter
 */
export class Result<T> {
  private readonly _ok: boolean;
  private readonly _value?: T;
  private readonly _error?: ResultError;

  private constructor(ok: boolean, value?: T, error?: ResultError) {
    this._ok = ok;
    this._value = value;
    this._error = error;
  }

  // --- Factories ----------------------------------------

  /** Create a success result. */
  static ok<T>(value: T): Result<T> {
    return new Result<T>(true, value);
  }

  /** Create a failure result from an error code. */
  static fail<T = never>(
    code: string,
    interpolations?: Record<string, any>,
  ): Result<T> {
    const def = ERROR_CODES[code] || ERROR_CODES.INTERNAL_ERROR;
    const message = Result.interpolate(def.message, interpolations);
    const suggestion = Result.interpolate(def.suggestion, interpolations);
    return new Result<T>(false, undefined, {
      code: def.code,
      message,
      httpStatus: def.httpStatus,
      suggestion,
      interpolated: interpolations,
    });
  }

  /** Create a failure with custom details. */
  static failWithDetails<T = never>(
    code: string,
    details: any,
    interpolations?: Record<string, any>,
  ): Result<T> {
    const def = ERROR_CODES[code] || ERROR_CODES.INTERNAL_ERROR;
    const message = Result.interpolate(def.message, interpolations);
    const suggestion = Result.interpolate(def.suggestion, interpolations);
    return new Result<T>(false, undefined, {
      code: def.code,
      message,
      httpStatus: def.httpStatus,
      suggestion,
      details,
      interpolated: interpolations,
    });
  }

  // --- Accessors ----------------------------------------

  get isOk(): boolean {
    return this._ok;
  }

  get isFail(): boolean {
    return !this._ok;
  }

  get value(): T {
    if (!this._ok) {
      throw new Error('Cannot access value of a failed Result. Use unwrap() at the controller boundary.');
    }
    return this._value as T;
  }

  get error(): ResultError {
    if (this._ok) {
      throw new Error('Cannot access error of a successful Result.');
    }
    return this._error as ResultError;
  }

  // --- Unwrap (controller boundary) ---------------------

  /**
   * Extracts the value on success, throws AppError on failure.
   * Use this at the controller boundary — GlobalExceptionFilter catches AppError.
   */
  unwrap(): T {
    if (this._ok) {
      return this._value as T;
    }
    const err = this._error!;
    const appError = AppError.from(err.code, err.interpolated);
    if (err.details) {
      throw appError.withDetails(err.details);
    }
    throw appError;
  }

  /**
   * Returns value on success, or the provided default on failure.
   */
  unwrapOr(defaultValue: T): T {
    return this._ok ? (this._value as T) : defaultValue;
  }

  // --- Transformers -------------------------------------

  /** Transform the success value. */
  map<U>(fn: (value: T) => U): Result<U> {
    if (this._ok) {
      return Result.ok(fn(this._value as T));
    }
    return new Result<U>(false, undefined, this._error);
  }

  /** Chain with another Result-returning function. */
  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this._ok) {
      return fn(this._value as T);
    }
    return new Result<U>(false, undefined, this._error);
  }

  /** Add details to a failed result (no-op on success). */
  withDetails(details: Record<string, unknown>): Result<T> {
    if (this._ok) return this;
    return new Result<T>(false, undefined, {
      ...this._error!,
      details,
    });
  }

  // --- Error response (for interceptor) -----------------

  /**
   * Returns error response object for the interceptor to format.
   * Only applicable to failed Results.
   */
  toErrorResponse(): {
    __isResultError: true;
    code: string;
    message: string;
    httpStatus: number;
    suggestion: string;
    details?: Record<string, unknown>;
  } | null {
    if (this._ok) return null;
    const err = this._error!;
    return {
      __isResultError: true as const,
      code: err.code,
      message: err.message,
      httpStatus: err.httpStatus,
      suggestion: err.suggestion,
      details: err.details,
    };
  }

  // --- Utilities ----------------------------------------

  /** Execute callback on success. Returns same result for chaining. */
  onOk(fn: (value: T) => void): Result<T> {
    if (this._ok) fn(this._value as T);
    return this;
  }

  /** Execute callback on failure. Returns same result for chaining. */
  onFail(fn: (error: ResultError) => void): Result<T> {
    if (!this._ok) fn(this._error!);
    return this;
  }

  // --- Private helpers ----------------------------------

  private static interpolate(
    template: string,
    values?: Record<string, any>,
  ): string {
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return values[key] !== undefined ? String(values[key]) : match;
    });
  }
}
