'use client';

import { useQuery } from '@tanstack/react-query';
import { walletAnalyticsApi } from '@/lib/api/wallet-analytics';

export function useWalletSummary(period?: string) {
  return useQuery({
    queryKey: ['wallet-analytics', 'summary', period],
    queryFn: () => walletAnalyticsApi.getSummary(period),
  });
}

export function useSpendByCategory(period?: string) {
  return useQuery({
    queryKey: ['wallet-analytics', 'spend-by-category', period],
    queryFn: () => walletAnalyticsApi.getSpendByCategory(period),
  });
}

export function useTopServices(period?: string) {
  return useQuery({
    queryKey: ['wallet-analytics', 'top-services', period],
    queryFn: () => walletAnalyticsApi.getTopServices(period),
  });
}

export function useDailyTrend(period?: string) {
  return useQuery({
    queryKey: ['wallet-analytics', 'daily-trend', period],
    queryFn: () => walletAnalyticsApi.getDailyTrend(period),
  });
}
