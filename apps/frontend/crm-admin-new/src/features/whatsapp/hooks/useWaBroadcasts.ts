import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { waBroadcastsService } from '../services/wa-broadcasts.service';

import type {
  BroadcastCreateData,
  BroadcastRecipientData,
  BroadcastListParams,
  BroadcastRecipientListParams,
} from '../types/broadcast.types';

const KEY = 'wa-broadcasts';

export function useWaBroadcastsList(params?: BroadcastListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => waBroadcastsService.getAll(params),
  });
}

export function useWaBroadcastDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => waBroadcastsService.getById(id),
    enabled: !!id,
  });
}

export function useWaBroadcastRecipients(broadcastId: string, params?: BroadcastRecipientListParams) {
  return useQuery({
    queryKey: [KEY, broadcastId, 'recipients', params],
    queryFn: () => waBroadcastsService.getRecipients(broadcastId, params),
    enabled: !!broadcastId,
  });
}

export function useCreateWaBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BroadcastCreateData) => waBroadcastsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAddBroadcastRecipients() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ broadcastId, recipients }: { broadcastId: string; recipients: BroadcastRecipientData[] }) =>
      waBroadcastsService.addRecipients(broadcastId, recipients),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useStartBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (broadcastId: string) => waBroadcastsService.start(broadcastId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function usePauseBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (broadcastId: string) => waBroadcastsService.pause(broadcastId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCancelBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (broadcastId: string) => waBroadcastsService.cancel(broadcastId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
