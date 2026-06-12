import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import * as ops from "../services/ops.service";
import type { BackupSchema } from "../types/ops.types";

// ─── DB Maintenance ──────────────────────────────────────────────────────────

export function useDbSummary() {
  return useQuery({ queryKey: ["ops", "db-summary"], queryFn: () => ops.getDbSummary() });
}

export function useTableStats() {
  return useQuery({ queryKey: ["ops", "table-stats"], queryFn: () => ops.getTableStats() });
}

export function useIndexStats() {
  return useQuery({ queryKey: ["ops", "index-stats"], queryFn: () => ops.getIndexStats() });
}

export function useBloatAnalysis() {
  return useQuery({ queryKey: ["ops", "bloat"], queryFn: () => ops.getBloatAnalysis() });
}

export function useSlowQueries(limit = 20) {
  return useQuery({ queryKey: ["ops", "slow-queries", limit], queryFn: () => ops.getSlowQueries(limit) });
}

export function useConnectionPool() {
  return useQuery({
    queryKey: ["ops", "connections"],
    queryFn: () => ops.getConnectionPool(),
    refetchInterval: 30_000,
  });
}

export function useRunVacuum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableName, full }: { tableName?: string; full?: boolean }) =>
      ops.runVacuum(tableName, full),
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(`VACUUM completed in ${data.data.duration}ms`);
        qc.invalidateQueries({ queryKey: ["ops", "bloat"] });
        qc.invalidateQueries({ queryKey: ["ops", "table-stats"] });
      } else {
        toast.error(data.data?.message || "VACUUM failed");
      }
    },
    onError: () => toast.error("VACUUM operation failed"),
  });
}

export function useRunAnalyze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableName }: { tableName?: string }) => ops.runAnalyze(tableName),
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(`ANALYZE completed in ${data.data.duration}ms`);
        qc.invalidateQueries({ queryKey: ["ops", "table-stats"] });
      } else {
        toast.error(data.data?.message || "ANALYZE failed");
      }
    },
    onError: () => toast.error("ANALYZE operation failed"),
  });
}

export function useRunReindex() {
  return useMutation({
    mutationFn: ({ indexName }: { indexName: string }) => ops.runReindex(indexName),
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(`REINDEX completed in ${data.data.duration}ms`);
      } else {
        toast.error(data.data?.message || "REINDEX failed");
      }
    },
    onError: () => toast.error("REINDEX operation failed"),
  });
}

export function useCleanupAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => ops.cleanupAll(),
    onSuccess: (data) => {
      const total = (data.data as any[])?.reduce((s: number, r: any) => s + (r.deleted || 0), 0) || 0;
      toast.success(`Cleanup complete — ${total} records deleted`);
      qc.invalidateQueries({ queryKey: ["ops"] });
    },
    onError: () => toast.error("Cleanup failed"),
  });
}

export function useCleanupDevLogs() {
  return useMutation({
    mutationFn: () => ops.cleanupDevLogs(),
    onSuccess: (data) => toast.success(`Deleted ${data.data?.deleted} dev log entries`),
    onError: () => toast.error("Cleanup failed"),
  });
}

export function useCleanupErrorLogs() {
  return useMutation({
    mutationFn: () => ops.cleanupErrorLogs(),
    onSuccess: (data) => toast.success(`Deleted ${data.data?.deleted} error log entries`),
    onError: () => toast.error("Cleanup failed"),
  });
}

export function useCleanupAuditLogs() {
  return useMutation({
    mutationFn: () => ops.cleanupAuditLogs(),
    onSuccess: (data) => toast.success(`Deleted ${data.data?.deleted} audit log entries`),
    onError: () => toast.error("Cleanup failed"),
  });
}

// ─── Backups ─────────────────────────────────────────────────────────────────

export function useBackups(schema?: string) {
  return useQuery({
    queryKey: ["ops", "backups", schema],
    queryFn: () => ops.listBackups(schema),
  });
}

export function useBackup(id: string) {
  return useQuery({
    queryKey: ["ops", "backup", id],
    queryFn: () => ops.getBackup(id),
    enabled: !!id,
  });
}

export function useRestores() {
  return useQuery({ queryKey: ["ops", "restores"], queryFn: () => ops.listRestores() });
}

export function usePgDumpStatus() {
  return useQuery({ queryKey: ["ops", "pg-dump-status"], queryFn: () => ops.getPgDumpStatus() });
}

export function useRunBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ schema, retentionDays }: { schema: BackupSchema; retentionDays?: number }) =>
      ops.runBackup(schema, retentionDays),
    onSuccess: (data) => {
      if (data.data?.status === "SUCCESS") {
        toast.success(`Backup of ${data.data.schemaName} completed`);
        qc.invalidateQueries({ queryKey: ["ops", "backups"] });
      } else {
        toast.error(data.data?.errorMessage || "Backup failed");
      }
    },
    onError: () => toast.error("Backup failed"),
  });
}

export function useRunBackupAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => ops.runBackupAll(),
    onSuccess: (data) => {
      const results = data.data as any[];
      const ok = results?.filter((r) => r.status === "SUCCESS").length || 0;
      const total = results?.length || 0;
      if (ok === total) {
        toast.success(`All ${total} schemas backed up successfully`);
      } else {
        toast.error(`${ok}/${total} schemas backed up — check logs`);
      }
      qc.invalidateQueries({ queryKey: ["ops", "backups"] });
    },
    onError: () => toast.error("Backup all failed"),
  });
}

export function useRestoreBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => ops.restoreBackup(id, notes),
    onSuccess: (data) => {
      if (data.data?.status === "SUCCESS") {
        toast.success("Database restored successfully");
        qc.invalidateQueries({ queryKey: ["ops", "restores"] });
      } else {
        toast.error("Restore failed — check restore logs");
      }
    },
    onError: () => toast.error("Restore failed"),
  });
}

// ─── Health ──────────────────────────────────────────────────────────────────

export function useHealthCheck() {
  return useQuery({
    queryKey: ["ops", "health"],
    queryFn: () => ops.getHealthCheck(),
    refetchInterval: 60_000,
  });
}

export function useDeepHealthCheck() {
  return useQuery({
    queryKey: ["ops", "health-deep"],
    queryFn: () => ops.getDeepHealthCheck(),
  });
}
