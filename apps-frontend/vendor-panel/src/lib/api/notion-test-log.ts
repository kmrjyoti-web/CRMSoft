import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';

export interface ModuleTestStatus {
  moduleId: string;
  moduleName: string;
  category?: string;
  notionStatus: 'Not Started' | 'In Progress' | 'Done' | 'Blocked' | string;
  notionPageId?: string;
  notionUrl?: string;
  lastSyncedAt?: string;
  syncState: 'synced' | 'not_synced';
}

export type TestLogStatus = 'Not Started' | 'In Progress' | 'Done' | 'Blocked';

export const notionTestLogApi = {
  listModules: () =>
    apiClient.get<ApiResponse<ModuleTestStatus[]>>('/settings/notion/test-log/modules').then(r => r.data),

  syncModule: (data: { moduleId: string; moduleName: string; status: TestLogStatus; notes?: string }) =>
    apiClient.post<ApiResponse<{ id: string; url: string }>>('/settings/notion/test-log/sync', data).then(r => r.data),

  syncAll: (statuses?: Record<string, string>) =>
    apiClient.post<ApiResponse<{ total: number; results: any[] }>>('/settings/notion/test-log/sync-all', { statuses }).then(r => r.data),
};
