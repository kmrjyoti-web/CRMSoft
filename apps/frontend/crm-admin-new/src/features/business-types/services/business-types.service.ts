import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { BusinessType, BusinessProfile, TerminologyOverride, AssignBusinessTypeDto, UpdateTradeProfileDto, UpsertTerminologyDto, BulkTerminologyDto } from "../types/business-types.types";

const BASE = "/api/v1/business-types";

export function listTypes(activeOnly?: boolean) {
  return apiClient.get<ApiResponse<BusinessType[]>>(BASE, { params: activeOnly ? { activeOnly } : undefined }).then((r) => r.data);
}

export function getByCode(code: string) {
  return apiClient.get<ApiResponse<BusinessType>>(`${BASE}/${code}`).then((r) => r.data);
}

export function getProfile() {
  return apiClient.get<ApiResponse<BusinessProfile>>(`${BASE}/profile`).then((r) => r.data);
}

export function seedDefaults() {
  return apiClient.post<ApiResponse<void>>(`${BASE}/seed`).then((r) => r.data);
}

export function assignType(dto: AssignBusinessTypeDto) {
  return apiClient.put<ApiResponse<void>>(`${BASE}/assign`, dto).then((r) => r.data);
}

export function updateTradeProfile(dto: UpdateTradeProfileDto) {
  return apiClient.put<ApiResponse<void>>(`${BASE}/trade-profile`, dto).then((r) => r.data);
}

export function getResolvedTerminology() {
  return apiClient.get<ApiResponse<Record<string, string>>>(`${BASE}/terminology/resolved`).then((r) => r.data);
}

export function getTerminologyOverrides() {
  return apiClient.get<ApiResponse<TerminologyOverride[]>>(`${BASE}/terminology/overrides`).then((r) => r.data);
}

export function upsertTerminology(dto: UpsertTerminologyDto) {
  return apiClient.put<ApiResponse<void>>(`${BASE}/terminology/overrides`, dto).then((r) => r.data);
}

export function bulkUpsertTerminology(dto: BulkTerminologyDto) {
  return apiClient.put<ApiResponse<void>>(`${BASE}/terminology/overrides/bulk`, dto).then((r) => r.data);
}

export function deleteTerminology(termKey: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/terminology/overrides/${termKey}`).then((r) => r.data);
}
