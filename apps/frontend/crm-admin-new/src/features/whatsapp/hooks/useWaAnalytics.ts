import { useQuery } from '@tanstack/react-query';

import { waAnalyticsService } from '../services/wa-analytics.service';

import type { WaAnalyticsParams } from '../types/analytics.types';

const KEY = 'wa-analytics';

export function useWaAnalytics(params?: WaAnalyticsParams) {
  return useQuery({
    queryKey: [KEY, 'stats', params],
    queryFn: () => waAnalyticsService.getStats(params),
  });
}

export function useWaAgentPerformance(params?: WaAnalyticsParams) {
  return useQuery({
    queryKey: [KEY, 'agents', params],
    queryFn: () => waAnalyticsService.getAgentPerformance(params),
  });
}
