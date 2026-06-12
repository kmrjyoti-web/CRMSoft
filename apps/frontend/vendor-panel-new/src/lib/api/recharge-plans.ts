import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { RechargePlan, RechargePlanCreateData } from '@/types/recharge-plan';

export const rechargePlansApi = {
  list: (params?: { industryCode?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<RechargePlan>>>('/admin/wallet/recharge-plans', { params }).then((r) => r.data),

  create: (data: RechargePlanCreateData) =>
    apiClient.post<ApiResponse<RechargePlan>>('/admin/wallet/recharge-plans', data).then((r) => r.data),

  update: (id: string, data: Partial<RechargePlanCreateData>) =>
    apiClient.put<ApiResponse<RechargePlan>>(`/admin/wallet/recharge-plans/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/admin/wallet/recharge-plans/${id}`).then((r) => r.data),
};
