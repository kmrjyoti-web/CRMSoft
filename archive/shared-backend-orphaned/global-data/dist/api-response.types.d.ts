export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: PaginationMeta;
    error?: ApiError;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface ApiError {
    statusCode: number;
    errorCode: string;
    message: string;
    traceId: string;
    solution?: string;
}
//# sourceMappingURL=api-response.types.d.ts.map