import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type { PermissionItem } from "../types/settings.types";

const BASE_URL = "/permissions";

export const permissionsService = {
  getAll: () =>
    apiClient
      .get<ApiResponse<PermissionItem[]>>(BASE_URL)
      .then((r) => r.data),

  getMatrix: () =>
    apiClient
      .get<ApiResponse<Record<string, string[]>>>(`${BASE_URL}/matrix`)
      .then((r) => r.data),

  updateRolePermissions: (roleId: string, permissionIds: string[]) =>
    apiClient
      .put<ApiResponse<void>>(`/roles/${roleId}/permissions`, {
        permissionIds,
      })
      .then((r) => r.data),
};
