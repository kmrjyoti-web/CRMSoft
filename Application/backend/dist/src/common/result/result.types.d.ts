export interface ResultError {
    code: string;
    message: string;
    httpStatus: number;
    suggestion: string;
    details?: Record<string, unknown>;
    interpolated?: Record<string, any>;
}
