'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testPlansApi, type CreateTestPlanBody } from '@/lib/api/test-plans';

export function useTestPlans(params?: { status?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['test-plans', params],
    queryFn: () => testPlansApi.list(params),
  });
}

export function useTestPlan(planId: string) {
  return useQuery({
    queryKey: ['test-plan', planId],
    queryFn: () => testPlansApi.getById(planId),
    enabled: !!planId,
  });
}

export function useCreateTestPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTestPlanBody) => testPlansApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['test-plans'] }),
  });
}

export function useUpdateTestPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, body }: { planId: string; body: Partial<CreateTestPlanBody> & { status?: string } }) =>
      testPlansApi.update(planId, body),
    onSuccess: (_, { planId }) => {
      qc.invalidateQueries({ queryKey: ['test-plans'] });
      qc.invalidateQueries({ queryKey: ['test-plan', planId] });
    },
  });
}

export function useUpdateTestPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      itemId,
      body,
    }: {
      planId: string;
      itemId: string;
      body: { status?: string; notes?: string; errorDetails?: string; priority?: string };
    }) => testPlansApi.updateItem(planId, itemId, body),
    onSuccess: (_, { planId }) => {
      qc.invalidateQueries({ queryKey: ['test-plan', planId] });
      qc.invalidateQueries({ queryKey: ['test-plans'] });
    },
  });
}

export function useTestDashboard(days = 30) {
  return useQuery({
    queryKey: ['test-dashboard', days],
    queryFn: () =>
      import('@/lib/api/client').then(m =>
        m.apiClient.get('/ops/test-run/dashboard', { params: { days } }).then(r => (r.data as any).data),
      ),
    staleTime: 60_000,
  });
}
