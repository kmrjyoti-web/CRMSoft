import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  CredentialItem,
  CredentialSchema,
  CredentialStatusSummary,
  UpsertCredentialPayload,
  CredentialProvider,
} from '../types/integrations.types';

const BASE_URL = '/api/v1/credentials';

export const integrationsService = {
  getAll: () =>
    apiClient
      .get<ApiResponse<CredentialItem[]>>(BASE_URL)
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<CredentialItem>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  getStatusSummary: () =>
    apiClient
      .get<ApiResponse<CredentialStatusSummary>>(`${BASE_URL}/status`)
      .then((r) => r.data),

  getSchemas: () =>
    apiClient
      .get<ApiResponse<CredentialSchema[]>>(`${BASE_URL}/schemas`)
      .then((r) => r.data),

  getSchema: (provider: CredentialProvider) =>
    apiClient
      .get<ApiResponse<CredentialSchema>>(`${BASE_URL}/schemas/${provider}`)
      .then((r) => r.data),

  upsert: (payload: UpsertCredentialPayload) =>
    apiClient
      .post<ApiResponse<CredentialItem>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: Partial<UpsertCredentialPayload>) =>
    apiClient
      .put<ApiResponse<CredentialItem>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  revoke: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  verify: (id: string) =>
    apiClient
      .post<ApiResponse<CredentialItem>>(`${BASE_URL}/${id}/verify`)
      .then((r) => r.data),

  refresh: (id: string) =>
    apiClient
      .post<ApiResponse<CredentialItem>>(`${BASE_URL}/${id}/refresh`)
      .then((r) => r.data),
};
