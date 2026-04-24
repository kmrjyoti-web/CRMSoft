import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';

export interface ScheduledTest {
  id: string;
  name: string;
  description?: string;
  cronExpression: string;
  targetModules: string[];
  testTypes: string[];
  dbSourceType: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  lastRunStatus?: string;
  createdAt: string;
  runs?: ScheduledTestRun[];
}

export interface ScheduledTestRun {
  id: string;
  scheduledTestId: string;
  testRunId?: string;
  backupRecordId?: string;
  testEnvId?: string;
  status: string;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface CreateScheduledTestDto {
  name: string;
  cronExpression: string;
  targetModules: string[];
  testTypes: string[];
  description?: string;
  dbSourceType?: string;
}

export interface UpdateScheduledTestDto {
  name?: string;
  description?: string;
  cronExpression?: string;
  targetModules?: string[];
  testTypes?: string[];
  isActive?: boolean;
}

export const scheduledTestApi = {
  list: (params?: { isActive?: boolean; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ data: ScheduledTest[]; total: number }>>('/ops/scheduled-test', { params }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<ScheduledTest>>(`/ops/scheduled-test/${id}`).then(r => r.data),

  create: (dto: CreateScheduledTestDto) =>
    apiClient.post<ApiResponse<ScheduledTest>>('/ops/scheduled-test', dto).then(r => r.data),

  update: (id: string, dto: UpdateScheduledTestDto) =>
    apiClient.patch<ApiResponse<ScheduledTest>>(`/ops/scheduled-test/${id}`, dto).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/ops/scheduled-test/${id}`).then(r => r.data),

  trigger: (id: string) =>
    apiClient.post<ApiResponse<{ runId: string }>>(`/ops/scheduled-test/${id}/trigger`).then(r => r.data),

  getRuns: (id: string, limit?: number) =>
    apiClient.get<ApiResponse<ScheduledTestRun[]>>(`/ops/scheduled-test/${id}/runs`, { params: { limit } }).then(r => r.data),
};
