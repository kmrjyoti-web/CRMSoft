import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Plan, PlanCreateData, PlanFilters } from '@/types/plan';

export const plansApi = {
  list: (filters?: PlanFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<Plan>>>('/admin/plans', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Plan>>(`/admin/plans/${id}`).then((r) => r.data),

  create: (data: PlanCreateData) =>
    apiClient.post<ApiResponse<Plan>>('/admin/plans', data).then((r) => r.data),

  update: (id: string, data: Partial<PlanCreateData>) =>
    apiClient.put<ApiResponse<Plan>>(`/admin/plans/${id}`, data).then((r) => r.data),

  deactivate: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/admin/plans/${id}/deactivate`).then((r) => r.data),
};
