import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  DesignationItem,
  DesignationDetail,
  DesignationCreateData,
  DesignationUpdateData,
  DesignationListParams,
} from "../types/designation.types";

const BASE_URL = "/api/v1/designations";

export const designationsService = {
  getAll: (params?: DesignationListParams) =>
    apiClient
      .get<ApiResponse<DesignationItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<DesignationDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: DesignationCreateData) =>
    apiClient
      .post<ApiResponse<DesignationDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: DesignationUpdateData) =>
    apiClient
      .put<ApiResponse<DesignationDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  getTree: (departmentId?: string) =>
    apiClient
      .get<ApiResponse<DesignationItem[]>>(`${BASE_URL}/tree`, {
        params: departmentId ? { departmentId } : undefined,
      })
      .then((r) => r.data),
};
