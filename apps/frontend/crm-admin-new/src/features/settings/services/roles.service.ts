import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  RoleListItem,
  RoleDetail,
  RoleListParams,
  RoleCreateData,
  RoleUpdateData,
} from "../types/settings.types";

const BASE_URL = "/api/v1/roles";

export const rolesService = {
  getAll: (params?: RoleListParams) =>
    apiClient
      .get<ApiResponse<RoleListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<RoleDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: RoleCreateData) =>
    apiClient
      .post<ApiResponse<RoleDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: RoleUpdateData) =>
    apiClient
      .put<ApiResponse<RoleDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),
};
