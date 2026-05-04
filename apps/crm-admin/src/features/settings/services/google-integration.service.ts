import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  GoogleConnectionStatus,
  GoogleOAuthInitiatePayload,
  GoogleOAuthInitiateResult,
  GoogleOAuthCallbackPayload,
  GoogleDisconnectPayload,
  GoogleCalendarSettings,
  GoogleContactsSettings,
} from '../types/google-integration.types';

const BASE_URL = '/api/v1/google';

export const googleIntegrationService = {
  getStatus: () =>
    apiClient
      .get<ApiResponse<GoogleConnectionStatus>>(`${BASE_URL}/status`)
      .then((r) => r.data),

  initiateAuth: (payload: GoogleOAuthInitiatePayload) =>
    apiClient
      .post<ApiResponse<GoogleOAuthInitiateResult>>(`${BASE_URL}/auth/initiate`, payload)
      .then((r) => r.data),

  handleCallback: (payload: GoogleOAuthCallbackPayload) =>
    apiClient
      .post<ApiResponse<GoogleConnectionStatus>>(`${BASE_URL}/auth/callback`, payload)
      .then((r) => r.data),

  disconnect: (payload?: GoogleDisconnectPayload) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/disconnect`, payload ?? {})
      .then((r) => r.data),

  syncService: (serviceId: string) =>
    apiClient
      .post<ApiResponse<{ syncedItems: number }>>(`${BASE_URL}/sync/${serviceId}`)
      .then((r) => r.data),

  getCalendarSettings: () =>
    apiClient
      .get<ApiResponse<GoogleCalendarSettings>>(`${BASE_URL}/settings/calendar`)
      .then((r) => r.data),

  updateCalendarSettings: (data: Partial<GoogleCalendarSettings>) =>
    apiClient
      .put<ApiResponse<GoogleCalendarSettings>>(`${BASE_URL}/settings/calendar`, data)
      .then((r) => r.data),

  getContactsSettings: () =>
    apiClient
      .get<ApiResponse<GoogleContactsSettings>>(`${BASE_URL}/settings/contacts`)
      .then((r) => r.data),

  updateContactsSettings: (data: Partial<GoogleContactsSettings>) =>
    apiClient
      .put<ApiResponse<GoogleContactsSettings>>(`${BASE_URL}/settings/contacts`, data)
      .then((r) => r.data),
};
