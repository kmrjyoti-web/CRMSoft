'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notionTestLogApi, type TestLogStatus } from '@/lib/api/notion-test-log';
import { toast } from 'sonner';

export function useNotionTestLogModules() {
  return useQuery({
    queryKey: ['notion-test-log-modules'],
    queryFn: () => notionTestLogApi.listModules(),
  });
}

export function useSyncModuleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { moduleId: string; moduleName: string; status: TestLogStatus; notes?: string }) =>
      notionTestLogApi.syncModule(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notion-test-log-modules'] });
      toast.success('Synced to Notion');
    },
    onError: () => toast.error('Notion sync failed. Check Notion configuration in Settings.'),
  });
}

export function useSyncAllModules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (statuses?: Record<string, string>) => notionTestLogApi.syncAll(statuses),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['notion-test-log-modules'] });
      toast.success(`Synced ${res.data?.total ?? 0} modules to Notion`);
    },
    onError: () => toast.error('Bulk sync failed'),
  });
}
