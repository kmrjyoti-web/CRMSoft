'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiTokensApi } from '@/lib/api/ai-tokens';
import type { AiSettings, AiTokenFilters } from '@/types/ai-token';

export function useAiTokenUsage() {
  return useQuery({
    queryKey: ['ai-token-usage'],
    queryFn: () => aiTokensApi.getUsage(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useTenantAiUsage(filters?: AiTokenFilters) {
  return useQuery({
    queryKey: ['tenant-ai-usage', filters],
    queryFn: () => aiTokensApi.getTenantUsage(filters),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAiSettings() {
  return useQuery({
    queryKey: ['ai-settings'],
    queryFn: () => aiTokensApi.getSettings(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateAiSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AiSettings) => aiTokensApi.updateSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-settings'] }),
  });
}
