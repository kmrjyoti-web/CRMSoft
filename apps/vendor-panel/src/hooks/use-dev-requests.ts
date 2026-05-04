'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devRequestsApi } from '@/lib/api/dev-requests';
import type { DevRequest, DevRequestFilters, RequestStatus } from '@/types/dev-request';

export function useDevRequests(filters?: DevRequestFilters) {
  return useQuery({
    queryKey: ['dev-requests', filters],
    queryFn: () => devRequestsApi.list(filters),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDevRequest(id: string) {
  return useQuery({
    queryKey: ['dev-request', id],
    queryFn: () => devRequestsApi.getById(id),
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateDevRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<DevRequest, 'id' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt'>) => devRequestsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dev-requests'] }),
  });
}

export function useUpdateDevRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<DevRequest, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>> }) =>
      devRequestsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dev-requests'] }),
  });
}

export function useUpdateDevRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => devRequestsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dev-requests'] }),
  });
}
