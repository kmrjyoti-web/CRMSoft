import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  Manufacturer,
  ManufacturerOrganization,
  ManufacturerContact,
  CreateManufacturerDto,
  LinkOrganizationDto,
  LinkContactDto,
  ManufacturerFilters,
} from "../types/manufacturers.types";

const BASE = "/api/v1/manufacturers";

// ── CRUD ────────────────────────────────────────────────

export function listManufacturers(params?: ManufacturerFilters) {
  return apiClient.get<ApiResponse<Manufacturer[]>>(BASE, { params }).then((r) => r.data);
}

export function getManufacturer(id: string) {
  return apiClient.get<ApiResponse<Manufacturer>>(`${BASE}/${id}`).then((r) => r.data);
}

export function createManufacturer(dto: CreateManufacturerDto) {
  return apiClient.post<ApiResponse<Manufacturer>>(BASE, dto).then((r) => r.data);
}

export function updateManufacturer(id: string, dto: Partial<CreateManufacturerDto>) {
  return apiClient.put<ApiResponse<Manufacturer>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function deleteManufacturer(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data);
}

// ── Organization Links ──────────────────────────────────

export function getManufacturerOrganizations(id: string) {
  return apiClient.get<ApiResponse<ManufacturerOrganization[]>>(`${BASE}/${id}/organizations`).then((r) => r.data);
}

export function linkOrganization(id: string, dto: LinkOrganizationDto) {
  return apiClient.post<ApiResponse<ManufacturerOrganization>>(`${BASE}/${id}/organizations`, dto).then((r) => r.data);
}

export function unlinkOrganization(id: string, orgId: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}/organizations/${orgId}`).then((r) => r.data);
}

// ── Contact Links ───────────────────────────────────────

export function getManufacturerContacts(id: string) {
  return apiClient.get<ApiResponse<ManufacturerContact[]>>(`${BASE}/${id}/contacts`).then((r) => r.data);
}

export function linkContact(id: string, dto: LinkContactDto) {
  return apiClient.post<ApiResponse<ManufacturerContact>>(`${BASE}/${id}/contacts`, dto).then((r) => r.data);
}

export function unlinkContact(id: string, contactId: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}/contacts/${contactId}`).then((r) => r.data);
}
