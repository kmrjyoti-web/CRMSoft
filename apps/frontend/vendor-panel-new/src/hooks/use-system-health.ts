'use client';

import { useQuery } from '@tanstack/react-query';
import { systemHealthApi } from '@/lib/api/system-health';

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: () => systemHealthApi.getHealth(),
    refetchInterval: 30000,
  });
}

export function useSystemMetrics(metric: string, hours?: number) {
  return useQuery({
    queryKey: ['system-metrics', metric, hours],
    queryFn: () => systemHealthApi.getMetrics(metric, hours),
    enabled: !!metric,
  });
}
