import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  LookupListItem,
  LookupDetail,
  LookupCreateData,
  LookupUpdateData,
} from "../types/lookup.types";

const BASE_URL = "/lookups";

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
};
