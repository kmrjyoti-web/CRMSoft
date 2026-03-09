import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  UserOverride,
  GrantPermissionDto,
  DenyPermissionDto,
} from "../types/user-overrides.types";

const BASE = "/user-overrides";

export function grantPermission(userId: string, dto: GrantPermissionDto) {
  return apiClient.post<ApiResponse<UserOverride>>(`${BASE}/${userId}/grant`, dto).then((r) => r.data);
}

export function denyPermission(userId: string, dto: DenyPermissionDto) {
  return apiClient.post<ApiResponse<UserOverride>>(`${BASE}/${userId}/deny`, dto).then((r) => r.data);
}

export function revokeOverride(userId: string, action: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${userId}/${action}`).then((r) => r.data);
}

export function getUserOverrides(userId: string) {
  return apiClient.get<ApiResponse<UserOverride[]>>(`${BASE}/${userId}`).then((r) => r.data);
}

export function listAllOverrides() {
  return apiClient.get<ApiResponse<UserOverride[]>>(`${BASE}`).then((r) => r.data);
}
