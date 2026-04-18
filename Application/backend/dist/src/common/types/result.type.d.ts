export { Result } from '../result/result';
export { combine, fromAsync, fromNullable, ensure } from '../result/result.helpers';
export type { ResultError } from '../result/result.types';
export type ResultType<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: {
        code: string;
        message: string;
        statusCode?: number;
        details?: Record<string, unknown>;
    };
};
export interface AppError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    traceId?: string;
    statusCode?: number;
}
export declare const Ok: <T>(data: T) => ResultType<T>;
export declare const Err: (code: string, message: string, statusCode?: number, details?: Record<string, unknown>) => ResultType<never>;
export declare const isOk: <T>(result: ResultType<T>) => result is {
    success: true;
    data: T;
};
export declare const isErr: <T>(result: ResultType<T>) => result is {
    success: false;
    error: AppError;
};
