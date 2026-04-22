import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  CronJob,
  CronJobUpdate,
  CronJobTogglePayload,
  CronJobParamsUpdate,
  CronRunHistory,
  CronDashboard,
  CronJobListParams,
  CronRunHistoryParams,
} from '../types/cron-config.types';

const BASE_URL = '/api/v1/admin/cron';

export const cronConfigService = {
  listJobs: (params?: CronJobListParams) =>
    apiClient
      .get<ApiResponse<CronJob[]>>(`${BASE_URL}/jobs`, { params })
      .then((r) => r.data),

  getJob: (jobCode: string) =>
    apiClient
      .get<ApiResponse<CronJob>>(`${BASE_URL}/jobs/${jobCode}`)
      .then((r) => r.data),

  updateJob: (jobCode: string, payload: CronJobUpdate) =>
    apiClient
      .put<ApiResponse<CronJob>>(`${BASE_URL}/jobs/${jobCode}`, payload)
      .then((r) => r.data),

  toggleJob: (jobCode: string, payload: CronJobTogglePayload) =>
    apiClient
      .post<ApiResponse<CronJob>>(`${BASE_URL}/jobs/${jobCode}/toggle`, payload)
      .then((r) => r.data),

  runJob: (jobCode: string) =>
    apiClient
      .post<ApiResponse<CronRunHistory>>(`${BASE_URL}/jobs/${jobCode}/run`)
      .then((r) => r.data),

  reloadJobs: () =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/jobs/reload`)
      .then((r) => r.data),

  updateParams: (jobCode: string, payload: CronJobParamsUpdate) =>
    apiClient
      .put<ApiResponse<CronJob>>(`${BASE_URL}/jobs/${jobCode}/params`, payload)
      .then((r) => r.data),

  getHistory: (jobCode: string, params?: CronRunHistoryParams) =>
    apiClient
      .get<ApiResponse<CronRunHistory[]>>(`${BASE_URL}/jobs/${jobCode}/history`, { params })
      .then((r) => r.data),

  getDashboard: () =>
    apiClient
      .get<ApiResponse<CronDashboard>>(`${BASE_URL}/dashboard`)
      .then((r) => r.data),
};
