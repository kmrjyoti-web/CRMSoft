'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api/listings';
import type { ListingFilters, CreateListingDto } from '@/types/listing';

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsApi.list(filters),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListingDto) => listingsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateListingDto> }) => listingsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}
