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
  details?: any;
  suggestion?: string;
  documentationUrl?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}
