import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';

export interface BackupRecord {
  id: string;
  tenantId: string;
  dbName: string;
  backupUrl: string;
  checksum: string;
  sizeBytes: string;
  tableCount?: number;
  rowCount?: string;
  isValidated: boolean;
  validatedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface BackupCheckResult {
  hasValidBackup: boolean;
  backupId?: string;
  createdAt?: string;
  dbName?: string;
  message?: string;
}

export const backupApi = {
  list: () =>
    apiClient.get<ApiResponse<BackupRecord[]>>('/ops/backup').then(r => r.data),

  create: (data: {
    dbName: string;
    backupUrl: string;
    checksum: string;
    sizeBytes: number;
    tableCount?: number;
    rowCount?: number;
    expiresAt?: string;
  }) =>
    apiClient.post<ApiResponse<BackupRecord>>('/ops/backup', data).then(r => r.data),

  validate: (id: string) =>
    apiClient.post<ApiResponse<{ valid: boolean }>>(`/ops/backup/validate/${id}`).then(r => r.data),

  check: () =>
    apiClient.post<ApiResponse<BackupCheckResult>>('/ops/backup/check').then(r => r.data),
};
