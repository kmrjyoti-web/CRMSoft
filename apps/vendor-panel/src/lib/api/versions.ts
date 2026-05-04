import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  AppVersion, IndustryPatch, VersionBackup, VersionStats,
  CreateVersionDto, CreatePatchDto, VersionFilters,
} from '@/types/version';

export const versionsApi = {
  // Versions
  list: (filters?: VersionFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<AppVersion>>>('/vendor/versions', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<AppVersion>>(`/vendor/versions/${id}`).then((r) => r.data),

  create: (data: CreateVersionDto) =>
    apiClient.post<ApiResponse<AppVersion>>('/vendor/versions', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateVersionDto>) =>
    apiClient.put<ApiResponse<AppVersion>>(`/vendor/versions/${id}`, data).then((r) => r.data),

  publish: (id: string) =>
    apiClient.post<ApiResponse<AppVersion>>(`/vendor/versions/${id}/publish`).then((r) => r.data),

  rollback: (id: string, reason: string) =>
    apiClient.post<ApiResponse<AppVersion>>(`/vendor/versions/${id}/rollback`, { reason }).then((r) => r.data),

  getStats: () =>
    apiClient.get<ApiResponse<VersionStats>>('/vendor/versions/stats').then((r) => r.data),

  // Industry Patches
  listPatches: (versionId: string, params?: { industryCode?: string; status?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<IndustryPatch>>>(`/vendor/versions/${versionId}/patches`, { params }).then((r) => r.data),

  createPatch: (versionId: string, data: CreatePatchDto) =>
    apiClient.post<ApiResponse<IndustryPatch>>(`/vendor/versions/${versionId}/patches`, data).then((r) => r.data),

  applyPatch: (patchId: string) =>
    apiClient.post<ApiResponse<IndustryPatch>>(`/vendor/versions/patches/${patchId}/apply`).then((r) => r.data),

  rollbackPatch: (patchId: string) =>
    apiClient.post<ApiResponse<IndustryPatch>>(`/vendor/versions/patches/${patchId}/rollback`).then((r) => r.data),

  // Backups
  listBackups: (versionId: string, params?: { backupType?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<VersionBackup>>>(`/vendor/versions/${versionId}/backups`, { params }).then((r) => r.data),

  createBackup: (versionId: string, data?: { backupType?: string; dbDumpPath?: string }) =>
    apiClient.post<ApiResponse<VersionBackup>>(`/vendor/versions/${versionId}/backups`, data).then((r) => r.data),

  restoreBackup: (backupId: string) =>
    apiClient.post<ApiResponse<VersionBackup>>(`/vendor/versions/backups/${backupId}/restore`).then((r) => r.data),

  deleteBackup: (backupId: string) =>
    apiClient.delete<ApiResponse<void>>(`/vendor/versions/backups/${backupId}`).then((r) => r.data),

  // Notion
  publishToNotion: (id: string) =>
    apiClient.post<ApiResponse<{ notionPageId: string | null }>>(`/vendor/versions/${id}/notion/publish`).then((r) => r.data),

  notionStatus: () =>
    apiClient.get<ApiResponse<{ configured: boolean; hasDatabaseId: boolean }>>('/vendor/versions/notion/status').then((r) => r.data),
};
