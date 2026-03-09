import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  ContactListItem,
  ContactDetail,
  ContactListParams,
  ContactCreateData,
  ContactUpdateData,
} from "../types/contacts.types";

const BASE_URL = "/api/v1/contacts";

export const contactsService = {
  getAll: (params?: ContactListParams) =>
    apiClient
      .get<ApiResponse<ContactListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<ContactDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: ContactCreateData) =>
    apiClient
      .post<ApiResponse<ContactDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: ContactUpdateData) =>
    apiClient
      .put<ApiResponse<ContactDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .post<ApiResponse<ContactDetail>>(`${BASE_URL}/${id}/deactivate`)
      .then((r) => r.data),

  reactivate: (id: string) =>
    apiClient
      .post<ApiResponse<ContactDetail>>(`${BASE_URL}/${id}/reactivate`)
      .then((r) => r.data),

  softDelete: (id: string) =>
    apiClient
      .post<ApiResponse<ContactDetail>>(`${BASE_URL}/${id}/soft-delete`)
      .then((r) => r.data),

  restore: (id: string) =>
    apiClient
      .post<ApiResponse<ContactDetail>>(`${BASE_URL}/${id}/restore`)
      .then((r) => r.data),

  permanentDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}/permanent`)
      .then((r) => r.data),
};
