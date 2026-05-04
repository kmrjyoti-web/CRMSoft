import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { waQuickRepliesService } from '../services/wa-quick-replies.service';

import type { WaQuickReplyCreateData } from '../types/whatsapp.types';

const KEY = 'wa-quick-replies';

export function useWaQuickReplies(wabaId?: string) {
  return useQuery({
    queryKey: [KEY, wabaId],
    queryFn: () => waQuickRepliesService.getAll(wabaId),
  });
}

export function useCreateQuickReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WaQuickReplyCreateData) => waQuickRepliesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
