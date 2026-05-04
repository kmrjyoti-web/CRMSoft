import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  EmailAccount,
  ConnectEmailPayload,
  EmailAccountListParams,
  TestConnectionPayload,
  TestConnectionResult,
  OAuthInitiatePayload,
  OAuthInitiateResult,
  OAuthCallbackPayload,
} from '../types/email-config.types';

const BASE_URL = '/api/v1/email-accounts';

export const emailConfigService = {
  getAll: (params?: EmailAccountListParams) =>
    apiClient
      .get<ApiResponse<EmailAccount[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<EmailAccount>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  connect: (payload: ConnectEmailPayload) =>
    apiClient
      .post<ApiResponse<EmailAccount>>(`${BASE_URL}/connect`, payload)
      .then((r) => r.data),

  disconnect: (id: string) =>
    apiClient
      .post<ApiResponse<EmailAccount>>(`${BASE_URL}/${id}/disconnect`)
      .then((r) => r.data),

  sync: (id: string) =>
    apiClient
      .post<ApiResponse<EmailAccount>>(`${BASE_URL}/${id}/sync`)
      .then((r) => r.data),

  testConnection: (payload: TestConnectionPayload) =>
    apiClient
      .post<ApiResponse<TestConnectionResult>>(`${BASE_URL}/test-connection`, payload)
      .then((r) => r.data),

  oauthInitiate: (payload: OAuthInitiatePayload) =>
    apiClient
      .post<ApiResponse<OAuthInitiateResult>>(`${BASE_URL}/oauth/initiate`, payload)
      .then((r) => r.data),

  oauthCallback: (payload: OAuthCallbackPayload) =>
    apiClient
      .post<ApiResponse<EmailAccount>>(`${BASE_URL}/oauth/callback`, payload)
      .then((r) => r.data),
};
