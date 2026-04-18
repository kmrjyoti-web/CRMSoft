import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type { WaQuickReplyItem, WaQuickReplyCreateData } from '../types/whatsapp.types';

const BASE_URL = '/api/v1/whatsapp/quick-replies';

export const waQuickRepliesService = {
  getAll: (wabaId?: string) =>
    apiClient.get<ApiResponse<WaQuickReplyItem[]>>(BASE_URL, { params: { wabaId } }).then((r) => r.data),

  create: (payload: WaQuickReplyCreateData) =>
    apiClient.post<ApiResponse<WaQuickReplyItem>>(BASE_URL, payload).then((r) => r.data),
};
