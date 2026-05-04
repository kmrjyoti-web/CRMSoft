import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/api-gateway.service";
import type {
  CreateApiKeyDto,
  UpdateScopesDto,
  CreateWebhookDto,
  UpdateWebhookDto,
  ApiLogFilters,
  UsageFilters,
} from "../types/api-gateway.types";

const KEYS = {
  apiKeys: "api-keys",
  scopes: "api-scopes",
  webhooks: "webhooks",
  webhookEvents: "webhook-events",
  deliveries: "webhook-deliveries",
  logs: "api-logs",
  usage: "api-usage",
  webhookStats: "webhook-stats",
};

// ── API Keys ─────────────────────────────────────────
export function useApiKeys() {
  return useQuery({ queryKey: [KEYS.apiKeys], queryFn: svc.listApiKeys });
}

export function useApiKey(id: string) {
  return useQuery({ queryKey: [KEYS.apiKeys, id], queryFn: () => svc.getApiKey(id), enabled: !!id });
}

export function useApiKeyScopes() {
  return useQuery({ queryKey: [KEYS.scopes], queryFn: svc.getApiKeyScopes });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateApiKeyDto) => svc.createApiKey(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.apiKeys] }),
  });
}

export function useUpdateApiKeyScopes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateScopesDto }) => svc.updateApiKeyScopes(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.apiKeys] }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.revokeApiKey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.apiKeys] }),
  });
}

export function useRegenerateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.regenerateApiKey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.apiKeys] }),
  });
}

// ── Webhooks ─────────────────────────────────────────
export function useWebhooks() {
  return useQuery({ queryKey: [KEYS.webhooks], queryFn: svc.listWebhooks });
}

export function useWebhook(id: string) {
  return useQuery({ queryKey: [KEYS.webhooks, id], queryFn: () => svc.getWebhook(id), enabled: !!id });
}

export function useWebhookEvents() {
  return useQuery({ queryKey: [KEYS.webhookEvents], queryFn: svc.getWebhookEvents });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateWebhookDto) => svc.createWebhook(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.webhooks] }),
  });
}

export function useUpdateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWebhookDto }) => svc.updateWebhook(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.webhooks] }),
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteWebhook(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.webhooks] }),
  });
}

export function useWebhookDeliveries(id: string) {
  return useQuery({ queryKey: [KEYS.deliveries, id], queryFn: () => svc.getWebhookDeliveries(id), enabled: !!id });
}

export function useTestWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.testWebhook(id),
    onSuccess: (_d, id) => qc.invalidateQueries({ queryKey: [KEYS.deliveries, id] }),
  });
}

// ── Logs ─────────────────────────────────────────────
export function useApiLogs(filters?: ApiLogFilters) {
  return useQuery({ queryKey: [KEYS.logs, filters], queryFn: () => svc.listApiLogs(filters) });
}

// ── Analytics ────────────────────────────────────────
export function useApiUsage(filters?: UsageFilters) {
  return useQuery({ queryKey: [KEYS.usage, filters], queryFn: () => svc.getUsageSummary(filters) });
}

export function useWebhookStats(filters?: UsageFilters) {
  return useQuery({ queryKey: [KEYS.webhookStats, filters], queryFn: () => svc.getWebhookStats(filters) });
}
