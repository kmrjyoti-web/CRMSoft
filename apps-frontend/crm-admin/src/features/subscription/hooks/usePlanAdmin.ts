import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planAdminService } from '../services/plan-admin.service';
import type { PlanCreateData, PlanUpdateData, UpsertPlanLimitData } from '../types/subscription.types';

const KEY = 'admin-plans';

export function usePlans(isActive?: boolean) {
  return useQuery({
    queryKey: [KEY, isActive],
    queryFn: () => planAdminService.getAll(isActive),
  });
}

export function usePlanDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => planAdminService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanCreateData) => planAdminService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlanUpdateData }) => planAdminService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => planAdminService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function usePlanLimits(planId: string) {
  return useQuery({
    queryKey: [KEY, planId, 'limits'],
    queryFn: () => planAdminService.getLimits(planId),
    enabled: !!planId,
  });
}

export function useUpsertPlanLimits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, limits }: { planId: string; limits: UpsertPlanLimitData[] }) =>
      planAdminService.upsertLimits(planId, limits),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
