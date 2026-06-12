import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Coupon, CouponCreateData } from '@/types/coupon';

export const couponsApi = {
  list: (params?: { search?: string; industryCode?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Coupon>>>('/admin/wallet/coupons', { params }).then((r) => r.data),

  create: (data: CouponCreateData) =>
    apiClient.post<ApiResponse<Coupon>>('/admin/wallet/coupons', data).then((r) => r.data),

  update: (id: string, data: Partial<CouponCreateData>) =>
    apiClient.put<ApiResponse<Coupon>>(`/admin/wallet/coupons/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/admin/wallet/coupons/${id}`).then((r) => r.data),
};
