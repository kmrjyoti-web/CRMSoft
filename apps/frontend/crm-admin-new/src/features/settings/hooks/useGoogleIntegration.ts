import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { googleIntegrationService } from '../services/google-integration.service';

import type {
  GoogleOAuthInitiatePayload,
  GoogleOAuthCallbackPayload,
  GoogleDisconnectPayload,
  GoogleCalendarSettings,
  GoogleContactsSettings,
} from '../types/google-integration.types';

const KEY = 'google-integration';

export function useGoogleStatus() {
  return useQuery({
    queryKey: [KEY, 'status'],
    queryFn: () => googleIntegrationService.getStatus(),
  });
}

export function useGoogleOAuthInitiate() {
  return useMutation({
    mutationFn: (payload: GoogleOAuthInitiatePayload) =>
      googleIntegrationService.initiateAuth(payload),
  });
}

export function useGoogleOAuthCallback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoogleOAuthCallbackPayload) =>
      googleIntegrationService.handleCallback(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useGoogleDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload?: GoogleDisconnectPayload) =>
      googleIntegrationService.disconnect(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useGoogleSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) =>
      googleIntegrationService.syncService(serviceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'status'] }),
  });
}

export function useGoogleCalendarSettings() {
  return useQuery({
    queryKey: [KEY, 'settings', 'calendar'],
    queryFn: () => googleIntegrationService.getCalendarSettings(),
  });
}

export function useUpdateGoogleCalendarSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<GoogleCalendarSettings>) =>
      googleIntegrationService.updateCalendarSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'settings', 'calendar'] }),
  });
}

export function useGoogleContactsSettings() {
  return useQuery({
    queryKey: [KEY, 'settings', 'contacts'],
    queryFn: () => googleIntegrationService.getContactsSettings(),
  });
}

export function useUpdateGoogleContactsSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<GoogleContactsSettings>) =>
      googleIntegrationService.updateContactsSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'settings', 'contacts'] }),
  });
}
