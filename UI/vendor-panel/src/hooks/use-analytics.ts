'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';

export function useAnalyticsOverview(days?: number) {
  return useQuery({
    queryKey: ['analytics', 'overview', days],
    queryFn: () => analyticsApi.overview({ days }),
  });
}

export function useRevenueData(days?: number) {
  return useQuery({
    queryKey: ['analytics', 'revenue', days],
    queryFn: () => analyticsApi.revenue({ days }),
  });
}

export function useListingPerformance(limit?: number) {
  return useQuery({
    queryKey: ['analytics', 'listing-performance', limit],
    queryFn: () => analyticsApi.listingPerformance({ limit }),
  });
}
