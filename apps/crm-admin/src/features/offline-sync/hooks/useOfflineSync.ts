import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/offline-sync.service";
import type {
  UpdatePolicyDto,
  CreateWarningRuleDto,
  IssueFlushDto,
  ResolveConflictDto,
  SyncLogFilters,
} from "../types/offline-sync.types";

const KEYS = {
  config: "sync-config",
  status: "sync-status",
  conflicts: "sync-conflicts",
  policies: "sync-policies",
  warningRules: "sync-warning-rules",
  flushCommands: "sync-flush-commands",
  devices: "sync-devices",
  dashboard: "sync-dashboard",
  audit: "sync-audit",
  analytics: "sync-analytics",
};

// ── Client-Facing ────────────────────────────────────
export function useSyncConfig() {
  return useQuery({ queryKey: [KEYS.config], queryFn: svc.getSyncConfig });
}

export function useSyncStatus() {
  return useQuery({ queryKey: [KEYS.status], queryFn: svc.getSyncStatus });
}

export function useSyncConflicts() {
  return useQuery({ queryKey: [KEYS.conflicts], queryFn: svc.listConflicts });
}

export function useSyncConflict(id: string) {
  return useQuery({ queryKey: [KEYS.conflicts, id], queryFn: () => svc.getConflict(id), enabled: !!id });
}

export function useResolveConflict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ResolveConflictDto }) => svc.resolveConflict(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.conflicts] }),
  });
}

// ── Admin Policies ───────────────────────────────────
export function useSyncPolicies() {
  return useQuery({ queryKey: [KEYS.policies], queryFn: svc.listPolicies });
}

export function useSyncPolicy(id: string) {
  return useQuery({ queryKey: [KEYS.policies, id], queryFn: () => svc.getPolicy(id), enabled: !!id });
}

export function useUpdateSyncPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePolicyDto }) => svc.updatePolicy(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.policies] }),
  });
}

export function useToggleSyncPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.togglePolicy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.policies] }),
  });
}

// ── Warning Rules ────────────────────────────────────
export function useSyncWarningRules() {
  return useQuery({ queryKey: [KEYS.warningRules], queryFn: svc.listWarningRules });
}

export function useCreateWarningRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateWarningRuleDto) => svc.createWarningRule(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.warningRules] }),
  });
}

export function useUpdateWarningRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateWarningRuleDto> }) => svc.updateWarningRule(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.warningRules] }),
  });
}

export function useDeleteWarningRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteWarningRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.warningRules] }),
  });
}

// ── Flush Commands ───────────────────────────────────
export function useIssueFlush() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: IssueFlushDto) => svc.issueFlush(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.flushCommands] }),
  });
}

export function useFlushCommands() {
  return useQuery({ queryKey: [KEYS.flushCommands], queryFn: svc.listFlushCommands });
}

// ── Devices ──────────────────────────────────────────
export function useSyncDevices() {
  return useQuery({ queryKey: [KEYS.devices], queryFn: svc.listDevices });
}

export function useBlockDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.blockDevice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.devices] }),
  });
}

// ── Dashboard & Analytics ────────────────────────────
export function useSyncDashboard() {
  return useQuery({ queryKey: [KEYS.dashboard], queryFn: svc.getSyncDashboard });
}

export function useSyncAudit(filters?: SyncLogFilters) {
  return useQuery({ queryKey: [KEYS.audit, filters], queryFn: () => svc.getSyncAudit(filters) });
}

export function useSyncAnalytics() {
  return useQuery({ queryKey: [KEYS.analytics], queryFn: svc.getSyncAnalytics });
}
