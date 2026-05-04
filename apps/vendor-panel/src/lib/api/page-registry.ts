import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  PageRegistryItem,
  PageRegistryStats,
  PageFilters,
  UpdatePageDto,
  AssignPageDto,
  BulkAssignDto,
  ScanResult,
  MenuSyncResult,
} from '@/types/page-registry';

const BASE = '/vendor/pages';

export const pageRegistryApi = {
  // 1. List pages
  list: (filters?: PageFilters) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<PageRegistryItem>>>(BASE, { params: filters })
      .then((r) => r.data),

  // 2. Stats
  stats: () =>
    apiClient
      .get<ApiResponse<PageRegistryStats>>(`${BASE}/stats`)
      .then((r) => r.data),

  // 3. Unassigned pages
  unassigned: (filters?: PageFilters) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<PageRegistryItem>>>(`${BASE}/unassigned`, { params: filters })
      .then((r) => r.data),

  // 4. Trigger scan
  scan: () =>
    apiClient
      .post<ApiResponse<ScanResult>>(`${BASE}/scan`)
      .then((r) => r.data),

  // 5. Get by ID
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<PageRegistryItem>>(`${BASE}/${id}`)
      .then((r) => r.data),

  // 6. Update page
  update: (id: string, data: UpdatePageDto) =>
    apiClient
      .patch<ApiResponse<PageRegistryItem>>(`${BASE}/${id}`, data)
      .then((r) => r.data),

  // 7. Assign to module
  assign: (id: string, data: AssignPageDto) =>
    apiClient
      .post<ApiResponse<PageRegistryItem>>(`${BASE}/${id}/assign`, data)
      .then((r) => r.data),

  // 8. Bulk assign
  bulkAssign: (data: BulkAssignDto) =>
    apiClient
      .post<ApiResponse<{ updated: number }>>(`${BASE}/bulk-assign`, data)
      .then((r) => r.data),

  // 9. Unassign
  unassign: (id: string) =>
    apiClient
      .delete<ApiResponse<PageRegistryItem>>(`${BASE}/${id}/unassign`)
      .then((r) => r.data),

  // 10. Get module pages
  getModulePages: (moduleCode: string) =>
    apiClient
      .get<ApiResponse<PageRegistryItem[]>>(`${BASE}/modules/${moduleCode}/pages`)
      .then((r) => r.data),

  // 11. Reorder module pages
  reorderModulePages: (moduleCode: string, orderedIds: string[]) =>
    apiClient
      .patch<ApiResponse<PageRegistryItem[]>>(`${BASE}/modules/${moduleCode}/pages/reorder`, { orderedIds })
      .then((r) => r.data),

  // 12. Sync menus
  syncMenus: (moduleCode: string) =>
    apiClient
      .post<ApiResponse<MenuSyncResult>>(`${BASE}/modules/${moduleCode}/pages/sync-menus`)
      .then((r) => r.data),
};
