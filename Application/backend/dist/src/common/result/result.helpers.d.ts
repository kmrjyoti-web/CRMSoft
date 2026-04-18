import { Result } from './result';
export declare function combine<T extends readonly Result<any>[]>(results: [...T]): Result<{
    [K in keyof T]: T[K] extends Result<infer U> ? U : never;
}>;
export declare function fromAsync<T>(fn: () => Promise<T>, failCode?: string): Promise<Result<T>>;
export declare function fromNullable<T>(value: T | null | undefined, failCode: string, interpolations?: Record<string, any>): Result<T>;
export declare function ensure<T>(value: T, predicate: (value: T) => boolean, failCode: string, interpolations?: Record<string, any>): Result<T>;
