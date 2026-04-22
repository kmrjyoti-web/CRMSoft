import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  CustomField,
  FormSchema,
  FieldValue,
  CreateCustomFieldDto,
  EntityTypeForFields,
} from "../types/custom-fields.types";

const BASE = "/api/v1/custom-fields";

// ── Definitions ─────────────────────────────────────────

export function listFields(entityType?: EntityTypeForFields) {
  return apiClient.get<ApiResponse<CustomField[]>>(`${BASE}/definitions`, { params: { entityType } }).then((r) => r.data);
}

export function createField(dto: CreateCustomFieldDto) {
  return apiClient.post<ApiResponse<CustomField>>(`${BASE}/definitions`, dto).then((r) => r.data);
}

export function updateField(id: string, dto: Partial<CreateCustomFieldDto>) {
  return apiClient.put<ApiResponse<CustomField>>(`${BASE}/definitions/${id}`, dto).then((r) => r.data);
}

export function deleteField(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/definitions/${id}`).then((r) => r.data);
}

// ── Schema & Values ─────────────────────────────────────

export function getFormSchema(entityType: EntityTypeForFields) {
  return apiClient.get<ApiResponse<FormSchema>>(`${BASE}/${entityType}/form-schema`).then((r) => r.data);
}

export function getFieldValues(entityType: EntityTypeForFields, entityId: string) {
  return apiClient.get<ApiResponse<FieldValue[]>>(`${BASE}/${entityType}/${entityId}/values`).then((r) => r.data);
}

export function setFieldValues(entityType: EntityTypeForFields, entityId: string, values: Record<string, unknown>) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${entityType}/${entityId}/values`, { values }).then((r) => r.data);
}

export function filterByCustomField(entityType: EntityTypeForFields, params: Record<string, unknown>) {
  return apiClient.get<ApiResponse<unknown>>(`${BASE}/${entityType}/filter`, { params }).then((r) => r.data);
}
