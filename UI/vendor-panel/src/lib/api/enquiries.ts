import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Enquiry, EnquiryFilters } from '@/types/enquiry';

export const enquiriesApi = {
  list: (filters?: EnquiryFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<Enquiry>>>('/marketplace/enquiries/vendor', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Enquiry>>(`/marketplace/enquiries/${id}`).then((r) => r.data),

  reply: (id: string, message: string) =>
    apiClient.post<ApiResponse<void>>(`/marketplace/enquiries/${id}/reply`, { message, senderType: 'VENDOR' }).then((r) => r.data),

  markRead: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/marketplace/enquiries/${id}/read`, { readerType: 'VENDOR' }).then((r) => r.data),
};
