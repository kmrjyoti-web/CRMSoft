/**
 * Re-export canonical types from shared-types.
 * The source of truth for these shapes is:
 *   UI/shared-types/src/common/api-response.ts
 *   → mirrors API/src/common/response/response-mapper.interceptor.ts
 */
export type {
  PaginationMeta,
  ApiResponse,
  ApiErrorBody,
  ApiErrorResponse,
  Paginated,
  ResultType,
} from '@shared-types';
export { isApiSuccess, isApiError, isOk, isErr } from '@shared-types';
