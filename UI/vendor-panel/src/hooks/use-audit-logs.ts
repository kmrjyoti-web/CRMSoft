'use client';

import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '@/lib/api/audit-logs';
import type { AuditLogFilters } from '@/types/audit-log';

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditLogsApi.list(filters),
  });
}
