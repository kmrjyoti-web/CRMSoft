export declare class AppError extends Error {
    readonly code: string;
    readonly httpStatus: number;
    readonly suggestion: string;
    readonly details: Record<string, unknown> | unknown[] | null;
    readonly interpolated: Record<string, any>;
    private constructor();
    static from(code: string, interpolations?: Record<string, any>): AppError;
    withDetails(details: Record<string, unknown> | unknown[]): AppError;
    private static interpolate;
}
