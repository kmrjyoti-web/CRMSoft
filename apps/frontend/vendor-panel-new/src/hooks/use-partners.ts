'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnersApi } from '@/lib/api/partners';
import type { PartnerFilters, CreatePartnerDto } from '@/types/partner';

export function usePartners(filters?: PartnerFilters) {
  return useQuery({
    queryKey: ['partners', filters],
    queryFn: () => partnersApi.list(filters),
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: () => partnersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePartnerDto) => partnersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partners'] }),
  });
}

export function useUpdatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePartnerDto> }) => partnersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partners'] }),
  });
}
