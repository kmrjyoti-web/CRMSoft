import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  ActivityListItem,
  ActivityDetail,
  ActivityListParams,
  ActivityCreateData,
  ActivityUpdateData,
  ActivityCompleteData,
} from "../types/activities.types";

const BASE_URL = "/activities";

export const activitiesService = {
  getAll: (params?: ActivityListParams) =>
    apiClient
      .get<ApiResponse<ActivityListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<ActivityDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: ActivityCreateData) =>
    apiClient
      .post<ApiResponse<ActivityDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: ActivityUpdateData) =>
    apiClient
      .put<ApiResponse<ActivityDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  complete: (id: string, payload: ActivityCompleteData) =>
    apiClient
      .post<ApiResponse<ActivityDetail>>(`${BASE_URL}/${id}/complete`, payload)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  getByEntity: (entityType: string, entityId: string) =>
    apiClient
      .get<ApiResponse<ActivityListItem[]>>(
        `${BASE_URL}/entity/${entityType}/${entityId}`
      )
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .post<ApiResponse<ActivityDetail>>(`${BASE_URL}/${id}/deactivate`)
      .then((r) => r.data),

  reactivate: (id: string) =>
    apiClient
      .post<ApiResponse<ActivityDetail>>(`${BASE_URL}/${id}/reactivate`)
      .then((r) => r.data),

  softDelete: (id: string) =>
    apiClient
      .post<ApiResponse<ActivityDetail>>(`${BASE_URL}/${id}/soft-delete`)
      .then((r) => r.data),

  restore: (id: string) =>
    apiClient
      .post<ApiResponse<ActivityDetail>>(`${BASE_URL}/${id}/restore`)
      .then((r) => r.data),

  permanentDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}/permanent`)
      .then((r) => r.data),
};
