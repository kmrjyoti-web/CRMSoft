import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  SavedFilter,
  CreateSavedFilterDto,
  EntityFilterAssignDto,
  FilterSearchDto,
} from "../types/saved-filters.types";

const BASE = "/api/v1/entity-filters";

// ── Saved Filters (user-level) ──────────────────────────
// Note: Backend uses /:entityType/:entityId/filters pattern for entity-level filters
// and a separate filter-search endpoint

export function getEntityFilters(entityType: string, entityId: string) {
  return apiClient.get<ApiResponse<SavedFilter[]>>(`/api/v1/${entityType}/${entityId}/filters`).then((r) => r.data);
}

export function assignFilters(entityType: string, entityId: string, dto: EntityFilterAssignDto) {
  return apiClient.post<ApiResponse<void>>(`/api/v1/${entityType}/${entityId}/filters`, dto).then((r) => r.data);
}

export function replaceFilters(entityType: string, entityId: string, dto: EntityFilterAssignDto & { category?: string }) {
  return apiClient.post<ApiResponse<void>>(`/api/v1/${entityType}/${entityId}/filters/replace`, dto).then((r) => r.data);
}

export function removeFilter(entityType: string, entityId: string, lookupValueId: string) {
  return apiClient.delete<ApiResponse<void>>(`/api/v1/${entityType}/${entityId}/filters/${lookupValueId}`).then((r) => r.data);
}

export function copyFilters(entityType: string, entityId: string, dto: { targetEntityType: string; targetEntityId: string }) {
  return apiClient.post<ApiResponse<void>>(`/api/v1/${entityType}/${entityId}/filters/copy`, dto).then((r) => r.data);
}

export function searchByFilters(entityType: string, dto: FilterSearchDto) {
  return apiClient.post<ApiResponse<{ entityIds: string[]; count: number }>>(`/api/v1/${entityType}/filter-search`, dto).then((r) => r.data);
}
