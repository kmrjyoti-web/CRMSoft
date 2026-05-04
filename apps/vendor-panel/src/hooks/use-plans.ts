'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '@/lib/api/plans';
import type { PlanFilters, PlanCreateData } from '@/types/plan';

export function usePlans(filters?: PlanFilters) {
  return useQuery({
    queryKey: ['plans', filters],
    queryFn: () => plansApi.list(filters),
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: () => plansApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanCreateData) => plansApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PlanCreateData> }) => plansApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  });
}

export function useDeactivatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  });
}
