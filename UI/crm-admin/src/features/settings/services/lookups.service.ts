import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  LookupListItem,
  LookupDetail,
  LookupCreateData,
  LookupUpdateData,
  LookupValueCreateData,
  LookupValueUpdateData,
} from "../types/lookup.types";

const BASE_URL = "/api/v1/lookups";

export const lookupsService = {
  getAll: (activeOnly = true) =>
    apiClient
      .get<ApiResponse<LookupListItem[]>>(BASE_URL, {
        params: { activeOnly },
      })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<LookupDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: LookupCreateData) =>
    apiClient
      .post<ApiResponse<LookupDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: LookupUpdateData) =>
    apiClient
      .put<ApiResponse<LookupDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .post<ApiResponse<null>>(`${BASE_URL}/${id}/deactivate`)
      .then((r) => r.data),

  // ── Value CRUD ─────────────────────────────────────────
  addValue: (lookupId: string, payload: LookupValueCreateData) =>
    apiClient
      .post<ApiResponse<LookupDetail>>(`${BASE_URL}/${lookupId}/values`, payload)
      .then((r) => r.data),

  updateValue: (valueId: string, payload: LookupValueUpdateData) =>
    apiClient
      .put<ApiResponse<null>>(`${BASE_URL}/values/${valueId}`, payload)
      .then((r) => r.data),

  deactivateValue: (valueId: string) =>
    apiClient
      .post<ApiResponse<null>>(`${BASE_URL}/values/${valueId}/deactivate`)
      .then((r) => r.data),

  reorderValues: (lookupId: string, orderedIds: string[]) =>
    apiClient
      .post<ApiResponse<LookupDetail>>(`${BASE_URL}/${lookupId}/values/reorder`, { orderedIds })
      .then((r) => r.data),

  resetDefaults: () =>
    apiClient
      .post<ApiResponse<{ restoredCount: number }>>(`${BASE_URL}/reset-defaults`)
      .then((r) => r.data),
};
