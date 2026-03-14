'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TableFull, Badge, Card, Icon } from '@/components/ui';
import { useErrorLogs, useErrorStats } from '../hooks/useErrorLogs';
import type { TenantErrorLog, ErrorSeverity } from '../types/error-log.types';

const SEVERITY_BADGE: Record<ErrorSeverity, "danger" | "warning" | "secondary" | "default"> = {
  CRITICAL: 'danger',
  ERROR: 'danger',
  WARNING: 'warning',
  INFO: 'secondary',
};

const ERROR_LOG_COLUMNS = [
  { id: 'timestamp', label: 'Timestamp', visible: true },
  { id: 'severity', label: 'Severity', visible: true },
  { id: 'errorCode', label: 'Error Code', visible: true },
  { id: 'message', label: 'Message', visible: true },
  { id: 'endpoint', label: 'Endpoint', visible: true },
  { id: 'statusCode', label: 'Status', visible: true },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function methodColor(method: string): string {
  switch (method?.toUpperCase()) {
    case 'GET': return '#16a34a';
    case 'POST': return '#2563eb';
    case 'PUT': case 'PATCH': return '#d97706';
    case 'DELETE': return '#dc2626';
    default: return '#6b7280';
  }
}

function flattenLogs(logs: TenantErrorLog[]): Record<string, any>[] {
  return logs.map((log) => ({
    id: log.id,
    timestamp: <span style={{ fontSize: 13, color: '#6b7280' }}>{formatDate(log.createdAt)}</span>,
    severity: <Badge variant={SEVERITY_BADGE[log.severity as ErrorSeverity] ?? 'default'}>{log.severity}</Badge>,
    errorCode: (
      <code style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
        {log.errorCode}
      </code>
    ),
    message: (
      <div style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }} title={log.message}>
        {log.message}
      </div>
    ),
    endpoint: (
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#6b7280' }}>
        <span style={{ fontWeight: 600, color: methodColor(log.method), marginRight: 4 }}>{log.method}</span>
        {log.path}
      </span>
    ),
    statusCode: (
      <span style={{ fontSize: 13, fontWeight: 500, color: log.statusCode >= 500 ? '#dc2626' : '#d97706' }}>
        {log.statusCode}
      </span>
    ),
  }));
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <Card>
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon as any} size={20} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{value}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
        </div>
      </div>
    </Card>
  );
}

export function ErrorLogList() {
  const { data, isLoading } = useErrorLogs({ page: 1, limit: 50 });
  const { data: statsData } = useErrorStats();

  const logs: TenantErrorLog[] = useMemo(() => {
    const raw = data?.data?.data ?? data?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const stats = statsData?.data;
  const rows = useMemo(() => (isLoading ? [] : flattenLogs(logs)), [logs, isLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <StatCard label="Total Errors" value={stats.total ?? 0} icon="alert-circle" color="#ef4444" />
          <StatCard label="Critical" value={stats.critical ?? 0} icon="alert-triangle" color="#7c3aed" />
          <StatCard label="Errors" value={stats.error ?? 0} icon="x-circle" color="#dc2626" />
          <StatCard label="Warnings" value={stats.warning ?? 0} icon="alert-triangle" color="#d97706" />
        </div>
      )}

      <TableFull
        data={rows}
        title="Error Logs"
        tableKey="error-logs-list"
        columns={ERROR_LOG_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
      />
    </div>
  );
}
