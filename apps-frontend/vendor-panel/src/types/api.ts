/**
 * Canonical API response types for vendor-panel.
 *
 * Previously re-exported from a `@shared-types` package that does not exist
 * anywhere in the repo. Inlined here until a proper Shared/shared-types/
 * workspace package is created (tracked as tech debt).
 */

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  code?: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: ApiErrorBody;
}

/**
 * Paginated list response — matches the backend ApiResponse.paginated() shape:
 * { data: T[], meta: PaginationMeta }
 * This is the nested form used in vendor panel list endpoints.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
