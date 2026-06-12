'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '@/lib/api/support-tickets';
import type { TicketFilters } from '@/types/support-ticket';

export function useTicketStats() {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: () => supportApi.getStats(),
  });
}

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => supportApi.list(filters),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => supportApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => supportApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket'] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
  });
}

export function useAddTicketMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { message: string; attachments?: string[]; isInternal?: boolean } }) =>
      supportApi.addMessage(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['ticket', variables.id] });
    },
  });
}

export function useTicketContext(id: string) {
  return useQuery({
    queryKey: ['ticket-context', id],
    queryFn: () => supportApi.getContext(id),
    enabled: !!id,
  });
}
