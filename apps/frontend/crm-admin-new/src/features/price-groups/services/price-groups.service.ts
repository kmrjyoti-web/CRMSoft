import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { CustomerPriceGroup, PriceGroupMember, CreatePriceGroupDto, AddMembersDto, PriceGroupFilters } from "../types/price-groups.types";

const BASE = "/api/v1/price-groups";

export function listGroups(params?: PriceGroupFilters) {
  return apiClient.get<ApiResponse<CustomerPriceGroup[]>>(BASE, { params }).then((r) => r.data);
}

export function getGroup(id: string) {
  return apiClient.get<ApiResponse<CustomerPriceGroup>>(`${BASE}/${id}`).then((r) => r.data);
}

export function createGroup(dto: CreatePriceGroupDto) {
  return apiClient.post<ApiResponse<CustomerPriceGroup>>(BASE, dto).then((r) => r.data);
}

export function updateGroup(id: string, dto: Partial<CreatePriceGroupDto>) {
  return apiClient.put<ApiResponse<CustomerPriceGroup>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function deactivateGroup(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/deactivate`).then((r) => r.data);
}

export function getMembers(id: string) {
  return apiClient.get<ApiResponse<PriceGroupMember[]>>(`${BASE}/${id}/members`).then((r) => r.data);
}

export function addMembers(id: string, dto: AddMembersDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/members`, dto).then((r) => r.data);
}

export function removeMember(id: string, mappingId: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}/members/${mappingId}`).then((r) => r.data);
}
