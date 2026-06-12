import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  LeadListItem,
  LeadDetail,
  LeadListParams,
  LeadCreateData,
  LeadUpdateData,
  QuickCreateLeadData,
} from "../types/leads.types";

const BASE_URL = "/api/v1/leads";

export const leadsService = {
  getAll: (params?: LeadListParams) =>
    apiClient
      .get<ApiResponse<LeadListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<LeadDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: LeadCreateData) =>
    apiClient
      .post<ApiResponse<LeadDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  quickCreate: (payload: QuickCreateLeadData) =>
    apiClient
      .post<ApiResponse<LeadDetail>>(`${BASE_URL}/quick-create`, payload)
      .then((r) => r.data),

  update: (id: string, payload: LeadUpdateData) =>
    apiClient
      .put<ApiResponse<LeadDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  changeStatus: (id: string, payload: { status: string; reason?: string }) =>
    apiClient
      .post<ApiResponse<LeadDetail>>(`${BASE_URL}/${id}/status`, payload)
      .then((r) => r.data),

  allocate: (id: string, payload: { allocatedToId: string }) =>
    apiClient
      .post<ApiResponse<LeadDetail>>(`${BASE_URL}/${id}/allocate`, payload)
      .then((r) => r.data),

  getTransitions: (id: string) =>
    apiClient
      .get<ApiResponse<string[]>>(`${BASE_URL}/${id}/transitions`)
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .post<ApiResponse<LeadDetail>>(`${BASE_URL}/${id}/deactivate`)
      .then((r) => r.data),

  reactivate: (id: string) =>
    apiClient
      .post<ApiResponse<LeadDetail>>(`${BASE_URL}/${id}/reactivate`)
      .then((r) => r.data),

  softDelete: (id: string) =>
    apiClient
      .post<ApiResponse<LeadDetail>>(`${BASE_URL}/${id}/soft-delete`)
      .then((r) => r.data),

  restore: (id: string) =>
    apiClient
      .post<ApiResponse<LeadDetail>>(`${BASE_URL}/${id}/restore`)
      .then((r) => r.data),

  permanentDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}/permanent`)
      .then((r) => r.data),
};
