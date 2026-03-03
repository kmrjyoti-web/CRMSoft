import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  MenuAdminItem,
  MenuCreateData,
  MenuUpdateData,
  MenuReorderData,
} from "../types/settings.types";

const BASE_URL = "/menus";

export const menusAdminService = {
  getTree: () =>
    apiClient
      .get<ApiResponse<MenuAdminItem[]>>(`${BASE_URL}/tree`)
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<MenuAdminItem>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: MenuCreateData) =>
    apiClient
      .post<ApiResponse<MenuAdminItem>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: MenuUpdateData) =>
    apiClient
      .put<ApiResponse<MenuAdminItem>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  deactivate: (id: string) =>
    apiClient
      .post<ApiResponse<MenuAdminItem>>(`${BASE_URL}/${id}/deactivate`)
      .then((r) => r.data),

  reorder: (payload: MenuReorderData) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/reorder`, payload)
      .then((r) => r.data),
};
