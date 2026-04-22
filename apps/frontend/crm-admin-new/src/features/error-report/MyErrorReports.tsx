'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TableFull, Badge } from '@/components/ui';
import { useMyReports } from './useErrorReport';
import { formatDate } from '@/lib/format-date';
import type { ErrorReportStatus, ErrorReportSeverity } from './error-report.service';

const STATUS_BADGE: Record<ErrorReportStatus, 'warning' | 'secondary' | 'success' | 'danger'> = {
  OPEN: 'warning',
  ACKNOWLEDGED: 'secondary',
  RESOLVED: 'success',
  ESCALATED: 'danger',
};

const SEVERITY_BADGE: Record<ErrorReportSeverity, 'danger' | 'warning' | 'secondary' | 'default'> = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'secondary',
  LOW: 'default',
};

const COLUMNS = [
  { id: 'title', label: 'Title', visible: true },
  { id: 'severity', label: 'Severity', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'createdAt', label: 'Created At', visible: true },
  { id: 'action', label: 'Action', visible: true },
];

export function MyErrorReports() {
  const { data: reports, isLoading } = useMyReports();
  const router = useRouter();

  const rows = useMemo(() => {
    if (isLoading || !reports) return [];
    return reports.map((r) => ({
      id: r.id,
      title: (
        <span style={{ fontSize: 13, color: '#1f2937', fontWeight: 500 }}>{r.title}</span>
      ),
      severity: (
        <Badge variant={SEVERITY_BADGE[r.severity] ?? 'default'}>{r.severity}</Badge>
      ),
      status: (
        <Badge variant={STATUS_BADGE[r.status] ?? 'default'}>{r.status}</Badge>
      ),
      createdAt: (
        <span style={{ fontSize: 13, color: '#6b7280' }}>{formatDate(r.createdAt)}</span>
      ),
      action: (
        <button
          onClick={() => router.push(`/settings/my-reports/${r.id}`)}
          style={{
            fontSize: 12,
            padding: '4px 10px',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            background: '#fff',
            cursor: 'pointer',
            color: '#374151',
          }}
        >
          View
        </button>
      ),
    }));
  }, [reports, isLoading, router]);

  return (
    <TableFull
      data={rows}
      title="My Error Reports"
      tableKey="my-error-reports"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="comfortable"
    />
  );
}
