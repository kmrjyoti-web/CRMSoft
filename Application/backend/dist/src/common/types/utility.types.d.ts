export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
    [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];
export type JsonField = Record<string, unknown>;
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    traceId?: string;
}
export interface ListQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export type FilterObject = Record<string, string | number | boolean | null | undefined>;
export type MetaRecord = Record<string, unknown>;
export type AsyncCallback<T = void> = () => Promise<T>;
export type SyncCallback<T = void> = () => T;
export type UUID = string;
export type TenantId = string;
export type UserId = string;
export declare function getErrorMessage(error: unknown): string;
export declare function getErrorStack(error: unknown): string | undefined;
