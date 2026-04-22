'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rechargePlansApi } from '@/lib/api/recharge-plans';
import type { RechargePlanCreateData } from '@/types/recharge-plan';

export function useRechargePlans(filters?: { industryCode?: string }) {
  return useQuery({
    queryKey: ['recharge-plans', filters],
    queryFn: () => rechargePlansApi.list(filters),
  });
}

export function useCreateRechargePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RechargePlanCreateData) => rechargePlansApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recharge-plans'] }),
  });
}

export function useUpdateRechargePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RechargePlanCreateData> }) => rechargePlansApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recharge-plans'] }),
  });
}

export function useDeleteRechargePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rechargePlansApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recharge-plans'] }),
  });
}
