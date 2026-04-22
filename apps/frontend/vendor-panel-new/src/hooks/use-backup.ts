'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backupApi } from '@/lib/api/backup';
import { toast } from 'sonner';

export function useBackupRecords() {
  return useQuery({
    queryKey: ['backup-records'],
    queryFn: () => backupApi.list(),
  });
}

export function useBackupCheck() {
  return useQuery({
    queryKey: ['backup-check'],
    queryFn: () => backupApi.check(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useValidateBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => backupApi.validate(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['backup-records'] });
      qc.invalidateQueries({ queryKey: ['backup-check'] });
      if (res.data?.valid) {
        toast.success('Backup validated successfully');
      } else {
        toast.error('Backup validation failed');
      }
    },
    onError: () => toast.error('Validation failed'),
  });
}
