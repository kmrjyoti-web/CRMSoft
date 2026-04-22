import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  AiSettingsData,
  UpdateAiSettingsPayload,
  AiModelsResponse,
  AiUsageStat,
} from '../types/ai-settings.types';

const BASE = '/api/v1/ai';

export const aiSettingsService = {
  getSettings: () =>
    apiClient.get<ApiResponse<AiSettingsData>>(`${BASE}/settings`).then((r) => r.data),

  updateSettings: (payload: UpdateAiSettingsPayload) =>
    apiClient.put<ApiResponse<AiSettingsData>>(`${BASE}/settings`, payload).then((r) => r.data),

  getModels: () =>
    apiClient.get<ApiResponse<AiModelsResponse>>(`${BASE}/models`).then((r) => r.data),

  getUsage: () =>
    apiClient.get<ApiResponse<AiUsageStat[]>>(`${BASE}/usage`).then((r) => r.data),
};
