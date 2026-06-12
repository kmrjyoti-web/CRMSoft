'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceRatesApi } from '@/lib/api/service-rates';
import type { ServiceRateCreateData } from '@/types/service-rate';

export function useServiceRates(filters?: { search?: string; category?: string; industryCode?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['service-rates', filters],
    queryFn: () => serviceRatesApi.list(filters),
  });
}

export function useCreateServiceRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceRateCreateData) => serviceRatesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-rates'] }),
  });
}

export function useUpdateServiceRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceRateCreateData> }) => serviceRatesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-rates'] }),
  });
}

export function useDeleteServiceRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceRatesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-rates'] }),
  });
}
