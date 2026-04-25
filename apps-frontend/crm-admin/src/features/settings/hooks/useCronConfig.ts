import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { cronConfigService } from '../services/cron-config.service';

import type {
  CronJobUpdate,
  CronJobTogglePayload,
  CronJobParamsUpdate,
  CronJobListParams,
  CronRunHistoryParams,
} from '../types/cron-config.types';

const KEY = 'cron-config';

export function useCronJobs(params?: CronJobListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => cronConfigService.listJobs(params),
  });
}

export function useCronJob(jobCode: string) {
  return useQuery({
    queryKey: [KEY, jobCode],
    queryFn: () => cronConfigService.getJob(jobCode),
    enabled: !!jobCode,
  });
}

export function useUpdateCronJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobCode, data }: { jobCode: string; data: CronJobUpdate }) =>
      cronConfigService.updateJob(jobCode, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useToggleCronJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobCode, data }: { jobCode: string; data: CronJobTogglePayload }) =>
      cronConfigService.toggleJob(jobCode, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRunCronJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobCode: string) => cronConfigService.runJob(jobCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReloadCrons() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cronConfigService.reloadJobs(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCronJobParams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobCode, data }: { jobCode: string; data: CronJobParamsUpdate }) =>
      cronConfigService.updateParams(jobCode, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCronHistory(jobCode: string, params?: CronRunHistoryParams) {
  return useQuery({
    queryKey: [KEY, 'history', jobCode, params],
    queryFn: () => cronConfigService.getHistory(jobCode, params),
    enabled: !!jobCode,
  });
}

export function useCronDashboard() {
  return useQuery({
    queryKey: [KEY, 'dashboard'],
    queryFn: () => cronConfigService.getDashboard(),
  });
}
