/** JSON-compatible value types */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue }
export type JsonArray = JsonValue[];

/** For Prisma JSONB fields — use instead of `any` */
export type JsonField = Record<string, unknown>;

/** Generic API response */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  traceId?: string;
}

/** Generic list query params */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Filter object for dynamic queries */
export type FilterObject = Record<string, string | number | boolean | null | undefined>;

/** Metadata record — for config/settings JSONB */
export type MetaRecord = Record<string, unknown>;

/** Callback types */
export type AsyncCallback<T = void> = () => Promise<T>;
export type SyncCallback<T = void> = () => T;

/** ID types */
export type UUID = string;
export type TenantId = string;
export type UserId = string;

/** Error-safe unknown type for catch blocks */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}
