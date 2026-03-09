import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/comments.service";
import type { CreateCommentDto, UpdateCommentDto, ReplyCommentDto } from "../types/comments.types";

const KEY = "comments";

export function useComments(entityType: string, entityId: string) {
  return useQuery({
    queryKey: [KEY, entityType, entityId],
    queryFn: () => svc.getComments(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useCommentThread(id: string) {
  return useQuery({
    queryKey: [KEY, "thread", id],
    queryFn: () => svc.getCommentThread(id),
    enabled: !!id,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCommentDto) => svc.createComment(dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.entityType, vars.entityId] }),
  });
}

export function useUpdateComment(entityType: string, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: UpdateCommentDto }) => svc.updateComment(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, entityType, entityId] }),
  });
}

export function useDeleteComment(entityType: string, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteComment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, entityType, entityId] }),
  });
}

export function useReplyComment(entityType: string, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: ReplyCommentDto }) => svc.replyToComment(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, entityType, entityId] }),
  });
}
