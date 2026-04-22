'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbAdminApi } from '@/lib/api/db-admin';
import type { DbFilters } from '@/types/db-admin';

export function useTenantDbs(filters?: DbFilters) {
  return useQuery({
    queryKey: ['tenant-dbs', filters],
    queryFn: () => dbAdminApi.list(filters),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useRunMigration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => dbAdminApi.runMigration(tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-dbs'] }),
  });
}

export function useRepairDb() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => dbAdminApi.repair(tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-dbs'] }),
  });
}

export function useBackupDb() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => dbAdminApi.backup(tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-dbs'] }),
  });
}
