/**
 * Shared API response types — mirrors the backend ResponseMapperInterceptor output.
 * Source of truth: API/src/common/response/response-mapper.interceptor.ts
 */

// ── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  /** Backend field: hasPrevious (from ApiResponse.paginated() and api-response.interface.ts) */
  hasPrevious: boolean;
}

// ── Standard API envelope ────────────────────────────────────────────────────

/**
 * Standard response wrapper from the NestJS ResponseMapperInterceptor.
 * Every successful backend response is shaped like this.
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
  path: string;
  requestId: string;
}

// ── Error shape ──────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
  suggestion?: string;
  documentationUrl?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: ApiErrorBody;
  timestamp: string;
  path: string;
  requestId: string;
}

// ── Paginated data wrapper ───────────────────────────────────────────────────

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ── Type guards ──────────────────────────────────────────────────────────────

export const isApiSuccess = <T>(res: ApiResponse<T> | ApiErrorResponse): res is ApiResponse<T> =>
  res.success === true;

export const isApiError = (res: ApiResponse<unknown> | ApiErrorResponse): res is ApiErrorResponse =>
  res.success === false;

// ── Result alias (functional-style, mirrors backend ResultType<T>) ───────────

export type ResultType<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorBody };

export const isOk = <T>(result: ResultType<T>): result is { success: true; data: T } =>
  result.success === true;

export const isErr = <T>(result: ResultType<T>): result is { success: false; error: ApiErrorBody } =>
  result.success === false;
