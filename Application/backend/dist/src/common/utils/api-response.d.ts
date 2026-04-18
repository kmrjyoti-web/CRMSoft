export declare class ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    meta?: Record<string, unknown>;
    constructor();
    static success<T>(data: T, message?: string, meta?: Record<string, unknown>): ApiResponse<T>;
    static error(message: string): ApiResponse<null>;
    static paginated<T>(data: T[], total: number, page: number, limit: number): ApiResponse<T[]>;
}
