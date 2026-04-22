/**
 * Standard API response — EVERY endpoint returns this shape.
 */
export interface ApiStandardResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: ApiErrorDetail;
  timestamp: string;
  path: string;
  requestId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  messageHi?: string;
  details?: Record<string, unknown>;
  suggestion?: string;
  suggestionHi?: string;
  documentationUrl?: string;
  helpUrl?: string;
  isRetryable?: boolean;
  retryAfterMs?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}
