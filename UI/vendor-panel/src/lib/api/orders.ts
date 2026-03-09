import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Order, OrderFilters } from '@/types/order';

export const ordersApi = {
  list: (filters?: OrderFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<Order>>>('/marketplace/orders/vendor', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/marketplace/orders/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: string, note?: string) =>
    apiClient.put<ApiResponse<Order>>(`/marketplace/orders/${id}/status`, { status, note }).then((r) => r.data),

  updateTracking: (id: string, data: { trackingNumber: string; carrier: string; estimatedDelivery?: string }) =>
    apiClient.put<ApiResponse<Order>>(`/marketplace/orders/${id}/tracking`, data).then((r) => r.data),
};
