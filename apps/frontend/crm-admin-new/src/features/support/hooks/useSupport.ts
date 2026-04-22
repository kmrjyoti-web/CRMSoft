import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as supportService from '../services/support.service';

export function useMyTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ['my-tickets', params],
    queryFn: () => supportService.getMyTickets(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => supportService.getTicket(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: supportService.createTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tickets'] }),
  });
}

export function useAddMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      message,
      attachments,
    }: {
      ticketId: string;
      message: string;
      attachments?: string[];
    }) => supportService.addMessage(ticketId, message, attachments),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ['ticket', vars.ticketId] }),
  });
}

export function useCloseTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: supportService.closeTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tickets'] }),
  });
}

export function useRateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      rating,
      comment,
    }: {
      id: string;
      rating: number;
      comment?: string;
    }) => supportService.rateTicket(id, rating, comment),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ['ticket', vars.id] }),
  });
}
