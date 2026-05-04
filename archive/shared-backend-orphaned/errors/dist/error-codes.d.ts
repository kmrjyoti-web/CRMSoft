/**
 * MASTER ERROR CODE REGISTRY.
 * Every error in the entire application is defined here.
 *
 * NAMING CONVENTION: {ENTITY}_{PROBLEM}
 * Examples: LEAD_NOT_FOUND, AUTH_TOKEN_EXPIRED, PLAN_LIMIT_REACHED
 */
export interface ErrorCodeDefinition {
    code: string;
    httpStatus: number;
    message: string;
    suggestion: string;
}
export declare const ERROR_CODES: Record<string, ErrorCodeDefinition>;
/** Total error codes count. */
export declare const TOTAL_ERROR_CODES: number;
//# sourceMappingURL=error-codes.d.ts.map