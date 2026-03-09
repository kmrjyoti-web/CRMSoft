import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  DepartmentItem,
  DepartmentDetail,
  DepartmentCreateData,
  DepartmentUpdateData,
  DepartmentListParams,
} from "../types/department.types";

const BASE_URL = "/api/v1/departments";

export const departmentsService = {
  getAll: (params?: DepartmentListParams) =>
    apiClient
      .get<ApiResponse<DepartmentItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<DepartmentDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: DepartmentCreateData) =>
    apiClient
      .post<ApiResponse<DepartmentDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: DepartmentUpdateData) =>
    apiClient
      .put<ApiResponse<DepartmentDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  getTree: () =>
    apiClient
      .get<ApiResponse<DepartmentItem[]>>(`${BASE_URL}/tree`)
      .then((r) => r.data),

  setHead: (id: string, userId: string) =>
    apiClient
      .post<ApiResponse<DepartmentDetail>>(`${BASE_URL}/${id}/set-head`, { userId })
      .then((r) => r.data),
};
