import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  WABAConfig,
  WABASetupPayload,
  WABAUpdatePayload,
} from '../types/whatsapp-config.types';

const BASE_URL = '/api/v1/whatsapp/waba';

export const whatsappConfigService = {
  getConfig: (id: string) =>
    apiClient
      .get<ApiResponse<WABAConfig>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  setup: (payload: WABASetupPayload) =>
    apiClient
      .post<ApiResponse<WABAConfig>>(`${BASE_URL}/setup`, payload)
      .then((r) => r.data),

  update: (id: string, payload: WABAUpdatePayload) =>
    apiClient
      .put<ApiResponse<WABAConfig>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),
};
