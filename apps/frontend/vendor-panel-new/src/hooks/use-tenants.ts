'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi } from '@/lib/api/tenants';
import type { TenantFilters } from '@/types/tenant-item';

export function useTenants(filters?: TenantFilters) {
  return useQuery({
    queryKey: ['tenants', filters],
    queryFn: () => tenantsApi.list(filters),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantsApi.getById(id),
    enabled: !!id,
  });
}

export function useSuspendTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantsApi.suspend(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}

export function useActivateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantsApi.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}

export function useExtendTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) => tenantsApi.extendTrial(id, days),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}
