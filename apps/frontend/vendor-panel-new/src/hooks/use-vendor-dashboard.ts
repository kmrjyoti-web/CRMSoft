'use client';

import { useQuery } from '@tanstack/react-query';
import { vendorDashboardApi, type DashboardFilters } from '@/lib/api/vendor-dashboard';

export function useVendorOverview(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['vendor-dashboard', 'overview', filters],
    queryFn: () => vendorDashboardApi.getOverview(filters),
  });
}

export function useVendorMRR(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['vendor-dashboard', 'mrr', filters],
    queryFn: () => vendorDashboardApi.getMRR(filters),
  });
}

export function useVendorGrowth(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['vendor-dashboard', 'growth', filters],
    queryFn: () => vendorDashboardApi.getGrowth(filters),
  });
}

export function useVendorPlanDistribution(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['vendor-dashboard', 'plan-distribution', filters],
    queryFn: () => vendorDashboardApi.getPlanDistribution(filters),
  });
}
