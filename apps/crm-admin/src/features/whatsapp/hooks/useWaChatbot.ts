import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { waChatbotService } from '../services/wa-chatbot.service';

import type {
  ChatbotFlowCreateData,
  ChatbotFlowUpdateData,
  ChatbotFlowListParams,
} from '../types/chatbot.types';

const KEY = 'wa-chatbot';

export function useWaChatbotFlows(params?: ChatbotFlowListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => waChatbotService.getAll(params),
  });
}

export function useWaChatbotFlowDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => waChatbotService.getById(id),
    enabled: !!id,
  });
}

export function useCreateChatbotFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ChatbotFlowCreateData) => waChatbotService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateChatbotFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChatbotFlowUpdateData }) =>
      waChatbotService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useToggleChatbotFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      waChatbotService.toggle(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
