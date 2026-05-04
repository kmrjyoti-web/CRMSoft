import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { integrationsService } from '../services/integrations.service';

import type { UpsertCredentialPayload, CredentialProvider } from '../types/integrations.types';

const KEY = 'integrations-credentials';

export function useCredentials() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => integrationsService.getAll(),
  });
}

export function useCredential(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => integrationsService.getById(id),
    enabled: !!id,
  });
}

export function useCredentialStatusSummary() {
  return useQuery({
    queryKey: [KEY, 'status'],
    queryFn: () => integrationsService.getStatusSummary(),
  });
}

export function useCredentialSchemas() {
  return useQuery({
    queryKey: [KEY, 'schemas'],
    queryFn: () => integrationsService.getSchemas(),
  });
}

export function useCredentialSchema(provider: CredentialProvider) {
  return useQuery({
    queryKey: [KEY, 'schemas', provider],
    queryFn: () => integrationsService.getSchema(provider),
    enabled: !!provider,
  });
}

export function useUpsertCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertCredentialPayload) => integrationsService.upsert(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UpsertCredentialPayload> }) =>
      integrationsService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRevokeCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => integrationsService.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useVerifyCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => integrationsService.verify(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRefreshCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => integrationsService.refresh(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
