import { ResultError } from './result.types';
export declare class Result<T> {
    private readonly _ok;
    private readonly _value?;
    private readonly _error?;
    private constructor();
    static ok<T>(value: T): Result<T>;
    static fail<T = never>(code: string, interpolations?: Record<string, any>): Result<T>;
    static failWithDetails<T = never>(code: string, details: any, interpolations?: Record<string, any>): Result<T>;
    get isOk(): boolean;
    get isFail(): boolean;
    get value(): T;
    get error(): ResultError;
    unwrap(): T;
    unwrapOr(defaultValue: T): T;
    map<U>(fn: (value: T) => U): Result<U>;
    flatMap<U>(fn: (value: T) => Result<U>): Result<U>;
    withDetails(details: Record<string, unknown>): Result<T>;
    toErrorResponse(): {
        __isResultError: true;
        code: string;
        message: string;
        httpStatus: number;
        suggestion: string;
        details?: Record<string, unknown>;
    } | null;
    onOk(fn: (value: T) => void): Result<T>;
    onFail(fn: (error: ResultError) => void): Result<T>;
    private static interpolate;
}
