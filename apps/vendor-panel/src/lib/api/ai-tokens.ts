import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { AiTokenUsage, TenantAiUsage, AiSettings, AiTokenFilters } from '@/types/ai-token';

export const aiTokensApi = {
  getUsage: () =>
    apiClient.get<ApiResponse<AiTokenUsage>>('/vendor/ai-tokens/usage').then((r) => r.data),

  getTenantUsage: (filters?: AiTokenFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<TenantAiUsage>>>('/vendor/ai-tokens/tenants', { params: filters }).then((r) => r.data),

  getSettings: () =>
    apiClient.get<ApiResponse<AiSettings>>('/vendor/ai-tokens/settings').then((r) => r.data),

  updateSettings: (data: AiSettings) =>
    apiClient.put<ApiResponse<AiSettings>>('/vendor/ai-tokens/settings', data).then((r) => r.data),
};
