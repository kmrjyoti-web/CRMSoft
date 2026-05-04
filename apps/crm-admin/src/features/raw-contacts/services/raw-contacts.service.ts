import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  RawContactListItem,
  RawContactDetail,
  RawContactListParams,
  RawContactCreateData,
  RawContactUpdateData,
  VerifyRawContactData,
  RejectRawContactData,
} from "../types/raw-contacts.types";

const BASE_URL = "/api/v1/raw-contacts";

export const rawContactsService = {
  getAll: (params?: RawContactListParams) =>
    apiClient
      .get<ApiResponse<RawContactListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: RawContactCreateData) =>
    apiClient
      .post<ApiResponse<RawContactDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: RawContactUpdateData) =>
    apiClient
      .put<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  verify: (id: string, payload?: VerifyRawContactData) =>
    apiClient
      .post<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}/verify`, payload)
      .then((r) => r.data),

  reject: (id: string, payload?: RejectRawContactData) =>
    apiClient
      .post<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}/reject`, payload)
      .then((r) => r.data),

  markDuplicate: (id: string) =>
    apiClient
      .post<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}/mark-duplicate`)
      .then((r) => r.data),

  reopen: (id: string) =>
    apiClient
      .post<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}/reopen`)
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .post<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}/deactivate`)
      .then((r) => r.data),

  reactivate: (id: string) =>
    apiClient
      .post<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}/reactivate`)
      .then((r) => r.data),

  softDelete: (id: string) =>
    apiClient
      .post<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}/soft-delete`)
      .then((r) => r.data),

  restore: (id: string) =>
    apiClient
      .post<ApiResponse<RawContactDetail>>(`${BASE_URL}/${id}/restore`)
      .then((r) => r.data),

  permanentDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}/permanent`)
      .then((r) => r.data),
};
