import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { RevenueSummary, SpendByCategory, TopService, DailyTrend } from '@/types/vendor-dashboard';

export const walletAnalyticsApi = {
  getSummary: (period?: string) =>
    apiClient.get<ApiResponse<RevenueSummary>>('/admin/wallet/wallet-analytics/summary', { params: period ? { period } : undefined }).then((r) => r.data),

  getSpendByCategory: (period?: string) =>
    apiClient.get<ApiResponse<SpendByCategory[]>>('/admin/wallet/wallet-analytics/spend-by-category', { params: period ? { period } : undefined }).then((r) => r.data),

  getTopServices: (period?: string) =>
    apiClient.get<ApiResponse<TopService[]>>('/admin/wallet/wallet-analytics/top-services', { params: period ? { period } : undefined }).then((r) => r.data),

  getDailyTrend: (period?: string) =>
    apiClient.get<ApiResponse<DailyTrend[]>>('/admin/wallet/wallet-analytics/daily-trend', { params: period ? { period } : undefined }).then((r) => r.data),
};
