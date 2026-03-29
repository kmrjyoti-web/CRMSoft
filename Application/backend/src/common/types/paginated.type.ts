/**
 * Re-exports and aliases for pagination types.
 * Canonical implementation is in src/common/utils/paginated-list.helper.ts
 */
export type {
  PaginatedResult,
  PaginationQuery,
} from '../utils/paginated-list.helper';
export {
  buildPaginatedResult,
  buildPaginationParams,
} from '../utils/paginated-list.helper';

/** Canonical Paginated<T> alias — matches the F2-1 spec name */
export type Paginated<T> = import('../utils/paginated-list.helper').PaginatedResult<T>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const paginate = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
