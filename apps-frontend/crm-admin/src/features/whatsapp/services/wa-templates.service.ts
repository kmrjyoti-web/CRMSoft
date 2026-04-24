import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  WaTemplateItem,
  WaTemplateCreateData,
  WaTemplateUpdateData,
  WaTemplateListParams,
} from '../types/template.types';

const BASE_URL = '/api/v1/whatsapp/templates';

export const waTemplatesService = {
  getAll: (params?: WaTemplateListParams) =>
    apiClient
      .get<ApiResponse<WaTemplateItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<WaTemplateItem>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: WaTemplateCreateData) =>
    apiClient
      .post<ApiResponse<WaTemplateItem>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: WaTemplateUpdateData) =>
    apiClient
      .put<ApiResponse<WaTemplateItem>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  sync: (wabaId: string) =>
    apiClient
      .post<ApiResponse<{ syncedCount: number }>>(`${BASE_URL}/sync`, { wabaId })
      .then((r) => r.data),
};
