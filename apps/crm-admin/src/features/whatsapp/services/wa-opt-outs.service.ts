import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type { WaOptOutItem, WaOptOutPayload, WaOptInPayload } from '../types/whatsapp.types';

const BASE_URL = '/api/v1/whatsapp';

export const waOptOutsService = {
  getAll: (params?: { wabaId?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<WaOptOutItem[]>>(`${BASE_URL}/opt-outs`, { params }).then((r) => r.data),

  optOut: (payload: WaOptOutPayload) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/opt-out`, payload).then((r) => r.data),

  optIn: (payload: WaOptInPayload) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/opt-in`, payload).then((r) => r.data),
};
