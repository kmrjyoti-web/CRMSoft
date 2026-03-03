import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  UserListItem,
  UserDetail,
  UserListParams,
  UserCreateData,
  UserUpdateData,
} from "../types/settings.types";

const BASE_URL = "/users";

export const usersService = {
  getAll: (params?: UserListParams) =>
    apiClient
      .get<ApiResponse<UserListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<UserDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: UserCreateData) =>
    apiClient
      .post<ApiResponse<UserDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: UserUpdateData) =>
    apiClient
      .put<ApiResponse<UserDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  activate: (id: string) =>
    apiClient
      .post<ApiResponse<UserDetail>>(`${BASE_URL}/${id}/activate`)
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .post<ApiResponse<UserDetail>>(`${BASE_URL}/${id}/deactivate`)
      .then((r) => r.data),

  softDelete: (id: string) =>
    apiClient
      .post<ApiResponse<UserDetail>>(`${BASE_URL}/${id}/soft-delete`)
      .then((r) => r.data),

  restore: (id: string) =>
    apiClient
      .post<ApiResponse<UserDetail>>(`${BASE_URL}/${id}/restore`)
      .then((r) => r.data),

  permanentDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}/permanent`)
      .then((r) => r.data),
};
