'use client';

import { useQuery } from '@tanstack/react-query';
import { licensesApi } from '@/lib/api/licenses';
import type { LicenseFilters } from '@/types/license';

export function useLicenses(filters?: LicenseFilters) {
  return useQuery({
    queryKey: ['licenses', filters],
    queryFn: () => licensesApi.list(filters),
  });
}

export function useLicense(id: string) {
  return useQuery({
    queryKey: ['license', id],
    queryFn: () => licensesApi.getById(id),
    enabled: !!id,
  });
}
