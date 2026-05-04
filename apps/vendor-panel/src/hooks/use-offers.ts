'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersApi } from '@/lib/api/offers';
import type { OfferFilters, OfferCreateData } from '@/types/offer';

export function useOffers(filters?: OfferFilters) {
  return useQuery({
    queryKey: ['offers', filters],
    queryFn: () => offersApi.list(filters),
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OfferCreateData) => offersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OfferCreateData> }) => offersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useDeactivateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offersApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}
