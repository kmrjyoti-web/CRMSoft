'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantAuditApi } from '@/lib/api/tenant-audit';
import type { AuditLogFilters } from '@/types/tenant-audit';

export function useAuditStatus(tenantId: string) {
  return useQuery({
    queryKey: ['audit-status', tenantId],
    queryFn: () => tenantAuditApi.getStatus(tenantId),
    enabled: !!tenantId,
  });
}

export function useAuditLogs(tenantId: string, filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit-logs', tenantId, filters],
    queryFn: () => tenantAuditApi.getLogs(tenantId, filters),
    enabled: !!tenantId,
  });
}

export function useAuditReport(tenantId: string) {
  return useQuery({
    queryKey: ['audit-report', tenantId],
    queryFn: () => tenantAuditApi.getReport(tenantId),
    enabled: !!tenantId,
  });
}

export function useAuditHistory(tenantId: string) {
  return useQuery({
    queryKey: ['audit-history', tenantId],
    queryFn: () => tenantAuditApi.getHistory(tenantId),
    enabled: !!tenantId,
  });
}

export function useAllActiveAudits() {
  return useQuery({
    queryKey: ['active-audits'],
    queryFn: () => tenantAuditApi.getAllActive(),
  });
}

export function useStartAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, reason, scheduledDays }: { tenantId: string; reason: string; scheduledDays?: number }) =>
      tenantAuditApi.startAudit(tenantId, { reason, scheduledDays }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['audit-status'] });
      qc.invalidateQueries({ queryKey: ['active-audits'] });
    },
  });
}

export function useStopAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => tenantAuditApi.stopAudit(tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['audit-status'] });
      qc.invalidateQueries({ queryKey: ['active-audits'] });
    },
  });
}
