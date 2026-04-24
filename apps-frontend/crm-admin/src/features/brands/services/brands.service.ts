import api from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  Brand,
  BrandOrganization,
  BrandContact,
  CreateBrandDto,
  LinkOrganizationDto,
  LinkContactDto,
  BrandFilters,
} from "../types/brands.types";

const BASE = "/api/v1/brands";

// ── CRUD ────────────────────────────────────────────────

export function listBrands(params?: BrandFilters) {
  return api.get<ApiResponse<Brand[]>>(BASE, { params }).then((r) => r.data);
}

export function getBrand(id: string) {
  return api.get<ApiResponse<Brand>>(`${BASE}/${id}`).then((r) => r.data);
}

export function createBrand(dto: CreateBrandDto) {
  return api.post<ApiResponse<Brand>>(BASE, dto).then((r) => r.data);
}

export function updateBrand(id: string, dto: Partial<CreateBrandDto>) {
  return api.put<ApiResponse<Brand>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function deleteBrand(id: string) {
  return api.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data);
}

// ── Organization Links ──────────────────────────────────

export function getBrandOrganizations(id: string) {
  return api.get<ApiResponse<BrandOrganization[]>>(`${BASE}/${id}/organizations`).then((r) => r.data);
}

export function linkOrganization(id: string, dto: LinkOrganizationDto) {
  return api.post<ApiResponse<BrandOrganization>>(`${BASE}/${id}/organizations`, dto).then((r) => r.data);
}

export function unlinkOrganization(id: string, orgId: string) {
  return api.delete<ApiResponse<void>>(`${BASE}/${id}/organizations/${orgId}`).then((r) => r.data);
}

// ── Contact Links ───────────────────────────────────────

export function getBrandContacts(id: string) {
  return api.get<ApiResponse<BrandContact[]>>(`${BASE}/${id}/contacts`).then((r) => r.data);
}

export function linkContact(id: string, dto: LinkContactDto) {
  return api.post<ApiResponse<BrandContact>>(`${BASE}/${id}/contacts`, dto).then((r) => r.data);
}

export function unlinkContact(id: string, contactId: string) {
  return api.delete<ApiResponse<void>>(`${BASE}/${id}/contacts/${contactId}`).then((r) => r.data);
}
