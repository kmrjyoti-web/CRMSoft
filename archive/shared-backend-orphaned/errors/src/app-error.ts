import { ERROR_CODES, ErrorCodeDefinition } from './error-codes';

/**
 * Custom application error.
 * Every module throws this instead of raw HttpException.
 *
 * Usage:
 *   throw AppError.from('LEAD_NOT_FOUND');
 *   throw AppError.from('PLAN_LIMIT_REACHED', { current: 500, limit: 500 });
 *   throw AppError.from('VALIDATION_ERROR').withDetails(fieldErrors);
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly suggestion: string;
  public readonly details: Record<string, unknown> | unknown[] | null;
  public readonly interpolated: Record<string, any>;

  private constructor(
    definition: ErrorCodeDefinition,
    interpolations?: Record<string, any>,
    details?: Record<string, unknown> | unknown[],
  ) {
    const message = AppError.interpolate(definition.message, interpolations);
    const suggestion = AppError.interpolate(definition.suggestion, interpolations);
    super(message);
    this.code = definition.code;
    this.httpStatus = definition.httpStatus;
    this.suggestion = suggestion;
    this.details = details ?? null;
    this.interpolated = interpolations || {};
  }

  /** Create error from code. */
  static from(code: string, interpolations?: Record<string, any>): AppError {
    const def = ERROR_CODES[code];
    if (!def) {
      return new AppError(ERROR_CODES.INTERNAL_ERROR, { originalCode: code });
    }
    return new AppError(def, interpolations);
  }

  /** Add details (field errors, extra context). */
  withDetails(details: Record<string, unknown> | unknown[]): AppError {
    return new AppError(
      {
        code: this.code,
        httpStatus: this.httpStatus,
        message: this.message,
        suggestion: this.suggestion,
      },
      this.interpolated,
      details,
    );
  }

  /** Replace {placeholders} in template string. */
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
