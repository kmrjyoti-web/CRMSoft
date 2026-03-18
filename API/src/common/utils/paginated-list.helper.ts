// ── Pagination Helper ──────────────────────────────────────
// Shared pagination utilities for all list/query handlers.
// Usage:
//   const { page, limit, skip, orderBy } = buildPaginationParams(query);
//   const [data, total] = await Promise.all([
//     prisma.entity.findMany({ where, skip, take: limit, orderBy }),
//     prisma.entity.count({ where }),
//   ]);
//   return buildPaginatedResult(data, total, page, limit);

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

/**
 * Parse and clamp pagination params.
 * Defaults: page=1, limit=20, max limit=100.
 */
export function buildPaginationParams(query: PaginationQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(Math.max(1, query.limit ?? 20), 100);
  const skip = (page - 1) * limit;
  const orderBy = query.sortBy
    ? { [query.sortBy]: query.sortOrder ?? 'desc' }
    : { createdAt: 'desc' as const };

  return { page, limit, skip, orderBy };
}

/**
 * Build a standardized paginated response.
 */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}
