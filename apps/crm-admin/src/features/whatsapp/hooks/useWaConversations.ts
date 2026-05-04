import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { waConversationsService } from '../services/wa-conversations.service';

import type {
  ConversationListParams,
  MessageListParams,
  SendTextPayload,
  SendTemplatePayload,
  SendMediaPayload,
  AssignConversationPayload,
  LinkEntityPayload,
} from '../types/conversation.types';

const CONV_KEY = 'wa-conversations';
const MSG_KEY = 'wa-messages';

export function useWaConversationsList(params?: ConversationListParams) {
  return useQuery({
    queryKey: [CONV_KEY, params],
    queryFn: () => waConversationsService.getAll(params),
    refetchInterval: 5000,
  });
}

export function useWaConversationDetail(id: string) {
  return useQuery({
    queryKey: [CONV_KEY, id],
    queryFn: () => waConversationsService.getById(id),
    enabled: !!id,
  });
}

export function useWaConversationMessages(conversationId: string, params?: MessageListParams) {
  return useQuery({
    queryKey: [MSG_KEY, conversationId, params],
    queryFn: () => waConversationsService.getMessages(conversationId, params),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });
}

export function useSendTextMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, payload }: { conversationId: string; payload: SendTextPayload }) =>
      waConversationsService.sendText(conversationId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [MSG_KEY, vars.conversationId] });
      qc.invalidateQueries({ queryKey: [CONV_KEY] });
    },
  });
}

export function useSendTemplateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, payload }: { conversationId: string; payload: SendTemplatePayload }) =>
      waConversationsService.sendTemplate(conversationId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [MSG_KEY, vars.conversationId] });
      qc.invalidateQueries({ queryKey: [CONV_KEY] });
    },
  });
}

export function useSendMediaMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, payload }: { conversationId: string; payload: SendMediaPayload }) =>
      waConversationsService.sendMedia(conversationId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [MSG_KEY, vars.conversationId] });
      qc.invalidateQueries({ queryKey: [CONV_KEY] });
    },
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => waConversationsService.markRead(conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONV_KEY] }),
  });
}

export function useAssignConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, payload }: { conversationId: string; payload: AssignConversationPayload }) =>
      waConversationsService.assign(conversationId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONV_KEY] }),
  });
}

export function useResolveConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => waConversationsService.resolve(conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONV_KEY] }),
  });
}

export function useReopenConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => waConversationsService.reopen(conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONV_KEY] }),
  });
}

export function useLinkConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, payload }: { conversationId: string; payload: LinkEntityPayload }) =>
      waConversationsService.linkEntity(conversationId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONV_KEY] }),
  });
}
