'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduledTestApi, type CreateScheduledTestDto, type UpdateScheduledTestDto } from '@/lib/api/scheduled-test';
import { toast } from 'sonner';

export function useScheduledTests(params?: { isActive?: boolean; page?: number }) {
  return useQuery({
    queryKey: ['scheduled-tests', params],
    queryFn: () => scheduledTestApi.list(params),
  });
}

export function useScheduledTest(id: string) {
  return useQuery({
    queryKey: ['scheduled-test', id],
    queryFn: () => scheduledTestApi.getById(id),
    enabled: !!id,
  });
}

export function useScheduledTestRuns(id: string, limit?: number) {
  return useQuery({
    queryKey: ['scheduled-test-runs', id, limit],
    queryFn: () => scheduledTestApi.getRuns(id, limit),
    enabled: !!id,
  });
}

export function useCreateScheduledTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateScheduledTestDto) => scheduledTestApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scheduled-tests'] });
      toast.success('Scheduled test created');
    },
    onError: () => toast.error('Failed to create scheduled test'),
  });
}

export function useUpdateScheduledTest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateScheduledTestDto) => scheduledTestApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scheduled-tests'] });
      qc.invalidateQueries({ queryKey: ['scheduled-test', id] });
      toast.success('Updated');
    },
    onError: () => toast.error('Failed to update'),
  });
}

export function useDeleteScheduledTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduledTestApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scheduled-tests'] });
      toast.success('Deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });
}

export function useTriggerScheduledTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduledTestApi.trigger(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['scheduled-test-runs', id] });
      toast.success('Test triggered successfully');
    },
    onError: () => toast.error('Failed to trigger test'),
  });
}
