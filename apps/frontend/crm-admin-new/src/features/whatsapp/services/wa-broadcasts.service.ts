import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  WaBroadcastItem,
  WaBroadcastRecipientItem,
  BroadcastCreateData,
  BroadcastRecipientData,
  BroadcastListParams,
  BroadcastRecipientListParams,
} from '../types/broadcast.types';

const BASE_URL = '/api/v1/whatsapp/broadcasts';

export const waBroadcastsService = {
  getAll: (params?: BroadcastListParams) =>
    apiClient.get<ApiResponse<WaBroadcastItem[]>>(BASE_URL, { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<WaBroadcastItem>>(`${BASE_URL}/${id}`).then((r) => r.data),

  create: (payload: BroadcastCreateData) =>
    apiClient.post<ApiResponse<WaBroadcastItem>>(BASE_URL, payload).then((r) => r.data),

  addRecipients: (broadcastId: string, recipients: BroadcastRecipientData[]) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${broadcastId}/recipients`, { recipients }).then((r) => r.data),

  getRecipients: (broadcastId: string, params?: BroadcastRecipientListParams) =>
    apiClient.get<ApiResponse<WaBroadcastRecipientItem[]>>(`${BASE_URL}/${broadcastId}/recipients`, { params }).then((r) => r.data),

  start: (broadcastId: string) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${broadcastId}/start`).then((r) => r.data),

  pause: (broadcastId: string) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${broadcastId}/pause`).then((r) => r.data),

  cancel: (broadcastId: string) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${broadcastId}/cancel`).then((r) => r.data),
};
