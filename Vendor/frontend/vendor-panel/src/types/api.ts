/**
 * Re-export canonical types from shared-types.
 * Source of truth: UI/shared-types/src/common/api-response.ts
 */
export type {
  ApiResponse,
  PaginationMeta,
  ApiErrorBody,
  ApiErrorResponse,
} from '@shared-types';

import type { PaginationMeta } from '@shared-types';

/**
 * Paginated list response — matches the backend ApiResponse.paginated() shape:
 * { data: T[], meta: PaginationMeta }
 * This is the nested form used in vendor panel list endpoints.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
