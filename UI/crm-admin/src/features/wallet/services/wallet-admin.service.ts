import { api } from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  WalletBalance,
  RechargePlanItem,
  RechargePlanCreateData,
  CouponItem,
  CouponCreateData,
  ServiceRateItem,
  ServiceRateCreateData,
  SpendByCategory,
  TopService,
  DailyTrend,
  RevenueSummary,
} from '../types/wallet.types';

export const walletAdminService = {
  // Wallets
  listWallets: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<WalletBalance[]>>('/api/v1/admin/wallets', { params }).then((r) => r.data),

  getWallet: (tenantId: string) =>
    api.get<ApiResponse<WalletBalance>>(`/api/v1/admin/wallets/${tenantId}`).then((r) => r.data),

  creditWallet: (tenantId: string, tokens: number, description: string) =>
    api.post<ApiResponse<any>>(`/api/v1/admin/wallets/${tenantId}/credit`, { tokens, description }).then((r) => r.data),

  debitWallet: (tenantId: string, tokens: number, description: string) =>
    api.post<ApiResponse<any>>(`/api/v1/admin/wallets/${tenantId}/debit`, { tokens, description }).then((r) => r.data),

  // Recharge Plans
  listRechargePlans: () =>
    api.get<ApiResponse<RechargePlanItem[]>>('/api/v1/admin/recharge-plans').then((r) => r.data),

  createRechargePlan: (data: RechargePlanCreateData) =>
    api.post<ApiResponse<RechargePlanItem>>('/api/v1/admin/recharge-plans', data).then((r) => r.data),

  updateRechargePlan: (id: string, data: Partial<RechargePlanCreateData & { isActive: boolean }>) =>
    api.put<ApiResponse<RechargePlanItem>>(`/api/v1/admin/recharge-plans/${id}`, data).then((r) => r.data),

  deleteRechargePlan: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/admin/recharge-plans/${id}`).then((r) => r.data),

  // Coupons
  listCoupons: () =>
    api.get<ApiResponse<CouponItem[]>>('/api/v1/admin/coupons').then((r) => r.data),

  createCoupon: (data: CouponCreateData) =>
    api.post<ApiResponse<CouponItem>>('/api/v1/admin/coupons', data).then((r) => r.data),

  updateCoupon: (id: string, data: Partial<CouponCreateData & { isActive: boolean }>) =>
    api.put<ApiResponse<CouponItem>>(`/api/v1/admin/coupons/${id}`, data).then((r) => r.data),

  deleteCoupon: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/admin/coupons/${id}`).then((r) => r.data),

  // Service Rates
  listServiceRates: (category?: string) =>
    api.get<ApiResponse<ServiceRateItem[]>>('/api/v1/admin/service-rates', { params: { category } }).then((r) => r.data),

  createServiceRate: (data: ServiceRateCreateData) =>
    api.post<ApiResponse<ServiceRateItem>>('/api/v1/admin/service-rates', data).then((r) => r.data),

  updateServiceRate: (id: string, data: Partial<ServiceRateCreateData & { isActive: boolean }>) =>
    api.put<ApiResponse<ServiceRateItem>>(`/api/v1/admin/service-rates/${id}`, data).then((r) => r.data),

  deleteServiceRate: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/admin/service-rates/${id}`).then((r) => r.data),

  // Analytics
  getRevenueSummary: (days?: number) =>
    api.get<ApiResponse<RevenueSummary>>('/api/v1/admin/wallet-analytics/summary', { params: { days } }).then((r) => r.data),

  getSpendByCategory: (tenantId?: string, days?: number) =>
    api.get<ApiResponse<SpendByCategory[]>>('/api/v1/admin/wallet-analytics/spend-by-category', { params: { tenantId, days } }).then((r) => r.data),

  getTopServices: (tenantId?: string, days?: number) =>
    api.get<ApiResponse<TopService[]>>('/api/v1/admin/wallet-analytics/top-services', { params: { tenantId, days } }).then((r) => r.data),

  getDailyTrend: (tenantId?: string, days?: number) =>
    api.get<ApiResponse<DailyTrend[]>>('/api/v1/admin/wallet-analytics/daily-trend', { params: { tenantId, days } }).then((r) => r.data),
};
