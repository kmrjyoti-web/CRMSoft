import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { DevRequest, DevRequestFilters, RequestStatus } from '@/types/dev-request';

export const devRequestsApi = {
  list: (filters?: DevRequestFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<DevRequest>>>('/vendor/dev-requests', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<DevRequest>>(`/vendor/dev-requests/${id}`).then((r) => r.data),

  create: (data: Omit<DevRequest, 'id' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ApiResponse<DevRequest>>('/vendor/dev-requests', data).then((r) => r.data),

  update: (id: string, data: Partial<Omit<DevRequest, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>>) =>
    apiClient.put<ApiResponse<DevRequest>>(`/vendor/dev-requests/${id}`, data).then((r) => r.data),

  updateStatus: (id: string, status: RequestStatus) =>
    apiClient.patch<ApiResponse<DevRequest>>(`/vendor/dev-requests/${id}/status`, { status }).then((r) => r.data),
};
