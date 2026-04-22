'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { industryApi } from '@/lib/api/industries';
import type { IndustryType } from '@/lib/api/industries';

export function useIndustries() {
  return useQuery({
    queryKey: ['industries'],
    queryFn: () => industryApi.list(),
  });
}

export function useIndustry(code: string) {
  return useQuery({
    queryKey: ['industries', code],
    queryFn: () => industryApi.getByCode(code),
    enabled: !!code,
  });
}

export function useSeedIndustries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => industryApi.seed(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['industries'] }),
  });
}

export function useUpdateIndustry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: Partial<IndustryType> }) =>
      industryApi.update(code, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['industries'] });
      qc.invalidateQueries({ queryKey: ['industries', vars.code] });
    },
  });
}
