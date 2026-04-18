export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare function buildPaginationParams(query: PaginationQuery): {
    page: number;
    limit: number;
    skip: number;
    orderBy: {
        [query.sortBy]: "asc" | "desc";
        createdAt?: undefined;
    } | {
        createdAt: "desc";
    };
};
export declare function buildPaginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
