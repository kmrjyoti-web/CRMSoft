export interface ErrorCodeDefinition {
    code: string;
    httpStatus: number;
    message: string;
    suggestion: string;
}
export declare const ERROR_CODES: Record<string, ErrorCodeDefinition>;
export declare const TOTAL_ERROR_CODES: number;
