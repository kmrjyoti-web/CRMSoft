import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { waOptOutsService } from '../services/wa-opt-outs.service';

import type { WaOptOutPayload, WaOptInPayload } from '../types/whatsapp.types';

const KEY = 'wa-opt-outs';

export function useWaOptOuts(params?: { wabaId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => waOptOutsService.getAll(params),
  });
}

export function useOptOutContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WaOptOutPayload) => waOptOutsService.optOut(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useOptInContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WaOptInPayload) => waOptOutsService.optIn(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
