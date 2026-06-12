'use client';

import { useMemo } from 'react';

import { TableFull, Badge } from '@/components/ui';

import { TableSkeleton } from '@/components/common/TableSkeleton';

import { useCronHistory } from '../hooks/useCronConfig';

import type { CronRunHistory } from '../types/cron-config.types';

// ── Props ────────────────────────────────────────────────

interface CronJobHistoryProps {
  jobCode: string;
}

// ── Columns ──────────────────────────────────────────────

const HISTORY_COLUMNS = [
  { id: 'startedAt', label: 'Started', visible: true },
  { id: 'finishedAt', label: 'Finished', visible: true },
  { id: 'duration', label: 'Duration', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'recordsProcessed', label: 'Records', visible: true },
  { id: 'triggeredBy', label: 'Triggered By', visible: true },
  { id: 'errorMessage', label: 'Error', visible: false },
  { id: 'retryAttempt', label: 'Retry #', visible: false },
];

// ── Filter config ────────────────────────────────────────

const HISTORY_FILTER_CONFIG = {
  sections: [
    {
      title: 'Run Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'status',
          options: [
            { value: 'SUCCESS', label: 'Success' },
            { value: 'FAILED', label: 'Failed' },
            { value: 'TIMEOUT', label: 'Timeout' },
            { value: 'RUNNING', label: 'Running' },
            { value: 'SKIPPED', label: 'Skipped' },
          ],
        },
      ],
    },
  ],
};

// ── Helper ───────────────────────────────────────────────

function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// ── Component ────────────────────────────────────────────

export function CronJobHistory({ jobCode }: CronJobHistoryProps) {
  const { data: response, isLoading } = useCronHistory(jobCode, { limit: 100 });

  const records = useMemo(() => {
    const raw = (response as any)?.data ?? response ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [response]);

  const tableData = useMemo(
    () =>
      records.map((run: CronRunHistory) => ({
        id: run.id,
        startedAt: new Date(run.startedAt).toLocaleString(),
        finishedAt: run.finishedAt
          ? new Date(run.finishedAt).toLocaleString()
          : '—',
        duration: formatDuration(run.durationMs),
        status: run.status,
        recordsProcessed: run.recordsProcessed ?? '—',
        triggeredBy: run.triggeredBy,
        errorMessage: run.errorMessage ?? '—',
        retryAttempt: run.retryAttempt,
      })),
    [records],
  );

  if (isLoading) return <TableSkeleton title="Run History" />;

  return (
    <div className="h-full">
      <TableFull
        title="Run History"
        data={tableData}
        columns={HISTORY_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={HISTORY_FILTER_CONFIG}
      />
    </div>
  );
}
