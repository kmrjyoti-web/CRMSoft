import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { ContactOrgMapping, LinkContactOrgDto, UpdateContactOrgDto, ChangeRelationDto } from "../types/contact-org-links.types";

const BASE = "/api/v1/contact-organizations";

export function linkContactOrg(dto: LinkContactOrgDto) {
  return apiClient.post<ApiResponse<ContactOrgMapping>>(BASE, dto).then((r) => r.data);
}

export function getMapping(id: string) {
  return apiClient.get<ApiResponse<ContactOrgMapping>>(`${BASE}/${id}`).then((r) => r.data);
}

export function getByContact(contactId: string) {
  return apiClient.get<ApiResponse<ContactOrgMapping[]>>(`${BASE}/by-contact/${contactId}`).then((r) => r.data);
}

export function getByOrganization(organizationId: string) {
  return apiClient.get<ApiResponse<ContactOrgMapping[]>>(`${BASE}/by-org/${organizationId}`).then((r) => r.data);
}

export function updateMapping(id: string, dto: UpdateContactOrgDto) {
  return apiClient.put<ApiResponse<ContactOrgMapping>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function setPrimary(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/set-primary`).then((r) => r.data);
}

export function changeRelation(id: string, dto: ChangeRelationDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/change-relation`, dto).then((r) => r.data);
}

export function unlinkContactOrg(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/unlink`).then((r) => r.data);
}
