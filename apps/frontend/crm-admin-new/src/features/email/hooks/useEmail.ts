import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/email.service";
import type { ComposeEmailDto, ReplyEmailDto, EmailFilters } from "../types/email.types";

const KEY = "emails";
const ACCOUNTS_KEY = "email-accounts";

// ── Queries ─────────────────────────────────────────────

export function useEmails(params?: EmailFilters) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listEmails(params),
  });
}

export function useEmail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => svc.getEmail(id),
    enabled: !!id,
  });
}

export function useEmailThread(threadId: string) {
  return useQuery({
    queryKey: [KEY, "thread", threadId],
    queryFn: () => svc.getEmailThread(threadId),
    enabled: !!threadId,
  });
}

export function useEntityEmails(entityType: string, entityId: string) {
  return useQuery({
    queryKey: [KEY, "entity", entityType, entityId],
    queryFn: () => svc.getEntityEmails(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useSearchEmails(query: string, params?: Omit<EmailFilters, "search">) {
  return useQuery({
    queryKey: [KEY, "search", query, params],
    queryFn: () => svc.searchEmails(query, params),
    enabled: !!query && query.length >= 2,
  });
}

export function useEmailAnalytics() {
  return useQuery({
    queryKey: [KEY, "analytics"],
    queryFn: () => svc.getEmailAnalytics(),
  });
}

// ── Email Accounts ──────────────────────────────────────

export function useEmailAccounts() {
  return useQuery({
    queryKey: [ACCOUNTS_KEY],
    queryFn: () => svc.listEmailAccounts(),
  });
}

export function useEmailAccount(id: string) {
  return useQuery({
    queryKey: [ACCOUNTS_KEY, id],
    queryFn: () => svc.getEmailAccount(id),
    enabled: !!id,
  });
}

// ── Mutations ───────────────────────────────────────────

export function useComposeEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ComposeEmailDto) => svc.composeEmail(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReplyEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ReplyEmailDto) => svc.replyToEmail(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSendEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.sendEmail(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useScheduleEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; scheduledAt: string }) => svc.scheduleEmail(vars.id, vars.scheduledAt),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCancelSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.cancelSchedule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useToggleStar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.toggleStar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useMarkEmailRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useLinkToEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; entityType: string; entityId: string }) =>
      svc.linkToEntity(vars.id, vars.entityType, vars.entityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUnlinkFromEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.unlinkFromEntity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

// ── Account Mutations ───────────────────────────────────

export function useCreateEmailAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<import("../types/email.types").EmailAccount>) => svc.createEmailAccount(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ACCOUNTS_KEY] }),
  });
}

export function useUpdateEmailAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<import("../types/email.types").EmailAccount> }) =>
      svc.updateEmailAccount(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ACCOUNTS_KEY] }),
  });
}

export function useDeleteEmailAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteEmailAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ACCOUNTS_KEY] }),
  });
}

export function useSyncEmailAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.syncEmailAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ACCOUNTS_KEY] }),
  });
}
