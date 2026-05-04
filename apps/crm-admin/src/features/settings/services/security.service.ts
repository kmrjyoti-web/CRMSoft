import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type { SecurityPolicy, IpAccessRule, CreateIpRuleDto } from '../types/security.types';

const BASE = '/api/v1/settings/security';

export const securityService = {
  getPolicy: () =>
    apiClient.get<ApiResponse<SecurityPolicy>>(BASE).then((r) => r.data),

  listIpRules: () =>
    apiClient.get<ApiResponse<IpAccessRule[]>>(`${BASE}/ip-rules`).then((r) => r.data),

  addIpRule: (dto: CreateIpRuleDto) =>
    apiClient.post<ApiResponse<IpAccessRule>>(`${BASE}/ip-rules`, dto).then((r) => r.data),

  removeIpRule: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/ip-rules/${id}`).then((r) => r.data),
};
