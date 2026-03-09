import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { AnalyticsOverview, RevenueData, ListingPerformance } from '@/types/analytics';

export const analyticsApi = {
  overview: (params?: { days?: number }) =>
    apiClient.get<ApiResponse<AnalyticsOverview>>('/marketplace/analytics/overview', { params }).then((r) => r.data),

  revenue: (params?: { days?: number }) =>
    apiClient.get<ApiResponse<RevenueData[]>>('/marketplace/analytics/orders', { params }).then((r) => r.data),

  listingPerformance: (params?: { limit?: number }) =>
    apiClient.get<ApiResponse<ListingPerformance[]>>('/marketplace/analytics/listings', { params }).then((r) => r.data),

  engagement: (params?: { days?: number }) =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/marketplace/analytics/engagement', { params }).then((r) => r.data),
};
