import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { emailConfigService } from '../services/email-config.service';

import type {
  ConnectEmailPayload,
  EmailAccountListParams,
  TestConnectionPayload,
  OAuthInitiatePayload,
  OAuthCallbackPayload,
} from '../types/email-config.types';

const KEY = 'email-config';

export function useEmailAccounts(params?: EmailAccountListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => emailConfigService.getAll(params),
  });
}

export function useEmailAccount(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => emailConfigService.getById(id),
    enabled: !!id,
  });
}

export function useConnectEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ConnectEmailPayload) => emailConfigService.connect(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDisconnectEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailConfigService.disconnect(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSyncEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailConfigService.sync(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useTestEmailConnection() {
  return useMutation({
    mutationFn: (data: TestConnectionPayload) => emailConfigService.testConnection(data),
  });
}

export function useOAuthInitiate() {
  return useMutation({
    mutationFn: (data: OAuthInitiatePayload) => emailConfigService.oauthInitiate(data),
  });
}

export function useOAuthCallback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OAuthCallbackPayload) => emailConfigService.oauthCallback(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
