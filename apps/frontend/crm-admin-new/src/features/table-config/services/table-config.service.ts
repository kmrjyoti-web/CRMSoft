import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  TableConfigRecord,
  SaveTableConfigPayload,
} from "../types/table-config.types";

const BASE_URL = "/api/v1/table-config";

export const tableConfigService = {
  get: (tableKey: string) =>
    apiClient
      .get<ApiResponse<TableConfigRecord | null>>(`${BASE_URL}/${tableKey}`)
      .then((r) => r.data),

  upsert: (tableKey: string, payload: SaveTableConfigPayload) =>
    apiClient
      .put<ApiResponse<TableConfigRecord>>(`${BASE_URL}/${tableKey}`, payload)
      .then((r) => r.data),

  upsertDefault: (tableKey: string, payload: SaveTableConfigPayload) =>
    apiClient
      .put<ApiResponse<TableConfigRecord>>(`${BASE_URL}/${tableKey}/default`, payload)
      .then((r) => r.data),

  reset: (tableKey: string) =>
    apiClient
      .delete<ApiResponse<{ deleted: boolean }>>(`${BASE_URL}/${tableKey}`)
      .then((r) => r.data),
};
