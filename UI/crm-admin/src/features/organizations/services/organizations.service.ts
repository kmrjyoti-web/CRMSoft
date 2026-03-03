import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  OrganizationListItem,
  OrganizationDetail,
  OrganizationListParams,
  OrganizationCreateData,
  OrganizationUpdateData,
} from "../types/organizations.types";

const BASE_URL = "/organizations";

export const organizationsService = {
  getAll: (params?: OrganizationListParams) =>
    apiClient
      .get<ApiResponse<OrganizationListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<OrganizationDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: OrganizationCreateData) =>
    apiClient
      .post<ApiResponse<OrganizationDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: OrganizationUpdateData) =>
    apiClient
      .put<ApiResponse<OrganizationDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .post<ApiResponse<OrganizationDetail>>(`${BASE_URL}/${id}/deactivate`)
      .then((r) => r.data),

  reactivate: (id: string) =>
    apiClient
      .post<ApiResponse<OrganizationDetail>>(`${BASE_URL}/${id}/reactivate`)
      .then((r) => r.data),

  softDelete: (id: string) =>
    apiClient
      .post<ApiResponse<OrganizationDetail>>(`${BASE_URL}/${id}/soft-delete`)
      .then((r) => r.data),

  restore: (id: string) =>
    apiClient
      .post<ApiResponse<OrganizationDetail>>(`${BASE_URL}/${id}/restore`)
      .then((r) => r.data),

  permanentDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}/permanent`)
      .then((r) => r.data),
};
