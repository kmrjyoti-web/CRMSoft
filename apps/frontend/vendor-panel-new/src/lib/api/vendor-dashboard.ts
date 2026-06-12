import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { VendorDashboardOverview, MRRDataPoint, GrowthDataPoint, PlanDistributionItem } from '@/types/vendor-dashboard';

export interface DashboardFilters {
  industryCode?: string;
}

export const vendorDashboardApi = {
  getOverview: (filters?: DashboardFilters) =>
    apiClient.get<ApiResponse<VendorDashboardOverview>>('/admin/vendor/dashboard', { params: filters }).then((r) => r.data),

  getMRR: (filters?: DashboardFilters) =>
    apiClient.get<ApiResponse<MRRDataPoint[]>>('/admin/vendor/dashboard/mrr', { params: filters }).then((r) => r.data),

  getGrowth: (filters?: DashboardFilters) =>
    apiClient.get<ApiResponse<GrowthDataPoint[]>>('/admin/vendor/dashboard/growth', { params: filters }).then((r) => r.data),

  getPlanDistribution: (filters?: DashboardFilters) =>
    apiClient.get<ApiResponse<PlanDistributionItem[]>>('/admin/vendor/dashboard/plan-distribution', { params: filters }).then((r) => r.data),
};
