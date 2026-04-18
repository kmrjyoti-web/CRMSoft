export type { PaginatedResult, PaginationQuery, } from '../utils/paginated-list.helper';
export { buildPaginatedResult, buildPaginationParams, } from '../utils/paginated-list.helper';
export type Paginated<T> = import('../utils/paginated-list.helper').PaginatedResult<T>;
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare const paginate: <T>(data: T[], total: number, page: number, limit: number) => Paginated<T>;
