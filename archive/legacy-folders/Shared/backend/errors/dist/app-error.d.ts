/**
 * Custom application error.
 * Every module throws this instead of raw HttpException.
 *
 * Usage:
 *   throw AppError.from('LEAD_NOT_FOUND');
 *   throw AppError.from('PLAN_LIMIT_REACHED', { current: 500, limit: 500 });
 *   throw AppError.from('VALIDATION_ERROR').withDetails(fieldErrors);
 */
export declare class AppError extends Error {
    readonly code: string;
    readonly httpStatus: number;
    readonly suggestion: string;
    readonly details: Record<string, unknown> | unknown[] | null;
    readonly interpolated: Record<string, any>;
    private constructor();
    /** Create error from code. */
    static from(code: string, interpolations?: Record<string, any>): AppError;
    /** Add details (field errors, extra context). */
    withDetails(details: Record<string, unknown> | unknown[]): AppError;
    /** Replace {placeholders} in template string. */
    private static interpolate;
}
//# sourceMappingURL=app-error.d.ts.map