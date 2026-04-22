import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  CustomerUser,
  CustomerMenuCategory,
  PortalRoute,
  EligibleEntity,
  PortalAnalytics,
  ActivatePortalDto,
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  UpdatePortalUserDto,
  ActivatePortalWithChannelsDto,
  ActivatePortalWithChannelsResponse,
} from '../types/customer-portal.types';

const BASE = '/api/v1/admin/customer-portal';

// ── Eligible Entities ─────────────────────────────────────────────────────────

export function getEligibleEntities() {
  return apiClient.get<ApiResponse<{ contacts: EligibleEntity[]; organizations: EligibleEntity[] }>>(
    `${BASE}/eligible`,
  ).then((r) => r.data);
}

// ── Portal Activation ─────────────────────────────────────────────────────────

export function activatePortal(dto: ActivatePortalDto) {
  return apiClient.post<ApiResponse<CustomerUser & { temporaryPassword: string }>>(
    `${BASE}/activate`,
    dto,
  ).then((r) => r.data);
}

/**
 * Activate portal and optionally trigger credential delivery on one or more channels.
 * Requires backend KUMAR-001X (channels[] + customMessage on ActivatePortalCommand).
 * Until KUMAR-001X merges, the extra fields are ignored by the backend (backward compat).
 */
export function activatePortalWithChannels(dto: ActivatePortalWithChannelsDto) {
  return apiClient
    .post<ActivatePortalWithChannelsResponse>(`${BASE}/activate`, dto)
    .then((r) => r.data);
}

// ── Portal Users ──────────────────────────────────────────────────────────────

export function listPortalUsers() {
  return apiClient.get<ApiResponse<CustomerUser[]>>(`${BASE}/users`).then((r) => r.data);
}

export function getPortalUser(id: string) {
  return apiClient.get<ApiResponse<CustomerUser>>(`${BASE}/users/${id}`).then((r) => r.data);
}

export function updatePortalUser(id: string, dto: UpdatePortalUserDto) {
  return apiClient.patch<ApiResponse<CustomerUser>>(`${BASE}/users/${id}`, dto).then((r) => r.data);
}

export function updatePageOverrides(id: string, pageOverrides: Record<string, boolean>) {
  return apiClient.patch<ApiResponse<CustomerUser>>(
    `${BASE}/users/${id}/page-overrides`,
    { pageOverrides },
  ).then((r) => r.data);
}

export function resetPortalPassword(id: string) {
  return apiClient.post<ApiResponse<{ temporaryPassword: string }>>(
    `${BASE}/users/${id}/reset-password`,
    {},
  ).then((r) => r.data);
}

export function deactivatePortalUser(id: string) {
  return apiClient.delete<ApiResponse<{ deactivated: boolean }>>(`${BASE}/users/${id}`).then((r) => r.data);
}

// ── Menu Categories ───────────────────────────────────────────────────────────

export function listMenuCategories() {
  return apiClient.get<ApiResponse<CustomerMenuCategory[]>>(`${BASE}/menu-categories`).then((r) => r.data);
}

export function createMenuCategory(dto: CreateMenuCategoryDto) {
  return apiClient.post<ApiResponse<CustomerMenuCategory>>(`${BASE}/menu-categories`, dto).then((r) => r.data);
}

export function updateMenuCategory(id: string, dto: UpdateMenuCategoryDto) {
  return apiClient.patch<ApiResponse<CustomerMenuCategory>>(
    `${BASE}/menu-categories/${id}`,
    dto,
  ).then((r) => r.data);
}

export function deleteMenuCategory(id: string) {
  return apiClient.delete<ApiResponse<{ deleted: boolean }>>(`${BASE}/menu-categories/${id}`).then((r) => r.data);
}

// ── Available Routes ──────────────────────────────────────────────────────────

export function getAvailableRoutes() {
  return apiClient.get<ApiResponse<PortalRoute[]>>(`${BASE}/available-routes`).then((r) => r.data);
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function getPortalAnalytics() {
  return apiClient.get<ApiResponse<PortalAnalytics>>(`${BASE}/analytics`).then((r) => r.data);
}

// ── Seed Defaults ─────────────────────────────────────────────────────────────

export function seedDefaultCategories() {
  return apiClient.post<ApiResponse<{ seeded: boolean }>>(`${BASE}/seed-defaults`, {}).then((r) => r.data);
}
