import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Partner, CreatePartnerDto, PartnerFilters } from '@/types/partner';

export const partnersApi = {
  list: (filters?: PartnerFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<Partner>>>('/vendor/partners', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Partner>>(`/vendor/partners/${id}`).then((r) => r.data),

  create: (data: CreatePartnerDto) =>
    apiClient.post<ApiResponse<Partner>>('/vendor/partners', data).then((r) => r.data),

  update: (id: string, data: Partial<CreatePartnerDto>) =>
    apiClient.patch<ApiResponse<Partner>>(`/vendor/partners/${id}`, data).then((r) => r.data),
};
