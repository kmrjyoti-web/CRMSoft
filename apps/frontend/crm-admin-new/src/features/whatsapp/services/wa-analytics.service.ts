import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  WaAnalyticsData,
  WaAgentPerformance,
  WaAnalyticsParams,
} from '../types/analytics.types';

const BASE_URL = '/api/v1/whatsapp/analytics';

export const waAnalyticsService = {
  getStats: (params?: WaAnalyticsParams) =>
    apiClient.get<ApiResponse<WaAnalyticsData>>(BASE_URL, { params }).then((r) => r.data),

  getAgentPerformance: (params?: WaAnalyticsParams) =>
    apiClient.get<ApiResponse<WaAgentPerformance[]>>(`${BASE_URL}/agents`, { params }).then((r) => r.data),
};
