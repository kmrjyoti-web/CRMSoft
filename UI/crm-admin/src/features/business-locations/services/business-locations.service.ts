import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { BusinessLocation, Country, State, City, CreateLocationDto, LocationFilters, LinkOrganizationDto } from "../types/business-locations.types";

const BASE = "/api/v1/business-locations";

export function listLocations(params?: LocationFilters) {
  return apiClient.get<ApiResponse<BusinessLocation[]>>(BASE, { params }).then((r) => r.data);
}

export function getLocationTree() {
  return apiClient.get<ApiResponse<BusinessLocation[]>>(`${BASE}/tree`).then((r) => r.data);
}

export function getLocation(id: string) {
  return apiClient.get<ApiResponse<BusinessLocation>>(`${BASE}/${id}`).then((r) => r.data);
}

export function getChildren(id: string) {
  return apiClient.get<ApiResponse<BusinessLocation[]>>(`${BASE}/${id}/children`).then((r) => r.data);
}

export function createLocation(dto: CreateLocationDto) {
  return apiClient.post<ApiResponse<BusinessLocation>>(BASE, dto).then((r) => r.data);
}

export function updateLocation(id: string, dto: Partial<CreateLocationDto>) {
  return apiClient.put<ApiResponse<BusinessLocation>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function deleteLocation(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data);
}

export function getCountries() {
  return apiClient.get<ApiResponse<Country[]>>(`${BASE}/countries`).then((r) => r.data);
}

export function linkOrganization(id: string, dto: LinkOrganizationDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/organizations`, dto).then((r) => r.data);
}

export function unlinkOrganization(id: string, orgId: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}/organizations/${orgId}`).then((r) => r.data);
}
