import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  WaChatbotFlowItem,
  ChatbotFlowCreateData,
  ChatbotFlowUpdateData,
  ChatbotFlowListParams,
} from '../types/chatbot.types';

const BASE_URL = '/api/v1/whatsapp/chatbot';

export const waChatbotService = {
  getAll: (params?: ChatbotFlowListParams) =>
    apiClient.get<ApiResponse<WaChatbotFlowItem[]>>(BASE_URL, { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<WaChatbotFlowItem>>(`${BASE_URL}/${id}`).then((r) => r.data),

  create: (payload: ChatbotFlowCreateData) =>
    apiClient.post<ApiResponse<WaChatbotFlowItem>>(BASE_URL, payload).then((r) => r.data),

  update: (id: string, payload: ChatbotFlowUpdateData) =>
    apiClient.put<ApiResponse<WaChatbotFlowItem>>(`${BASE_URL}/${id}`, payload).then((r) => r.data),

  toggle: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${id}/toggle`, { status }).then((r) => r.data),
};
