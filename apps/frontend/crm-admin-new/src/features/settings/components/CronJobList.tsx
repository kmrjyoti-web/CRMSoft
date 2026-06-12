'use client';

import { useMemo, useCallback, useState } from 'react';

import toast from 'react-hot-toast';

import { TableFull, Button, Icon, Badge } from '@/components/ui';

import { TableSkeleton } from '@/components/common/TableSkeleton';
import { HelpButton } from '@/components/common/HelpButton';

import { useEntityPanel, useContentPanel } from '@/hooks/useEntityPanel';

import {
  useCronJobs,
  useToggleCronJob,
  useRunCronJob,
  useReloadCrons,
  useCronDashboard,
} from '../hooks/useCronConfig';

import { CronJobEditForm } from './CronJobEditForm';
import { CronJobHistory } from './CronJobHistory';
import { CronConfigUserHelp } from '../help/CronConfigUserHelp';
import { CronConfigDevHelp } from '../help/CronConfigDevHelp';

import type { CronJob, CronJobStatus } from '../types/cron-config.types';

// ── Columns ──────────────────────────────────────────────

const CRON_COLUMNS = [
  { id: 'jobName', label: 'Job Name', visible: true },
  { id: 'jobCode', label: 'Code', visible: true },
  { id: 'cronExpression', label: 'Schedule', visible: true },
  { id: 'moduleName', label: 'Module', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'lastRunStatus', label: 'Last Run', visible: true },
  { id: 'lastRunAt', label: 'Last Run At', visible: true },
  { id: 'nextRunAt', label: 'Next Run', visible: true },
  { id: 'duration', label: 'Avg Duration', visible: false },
  { id: 'totalRunCount', label: 'Total Runs', visible: false },
  { id: 'successRate', label: 'Success Rate', visible: false },
];

// ── Status colors ────────────────────────────────────────

const JOB_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  DISABLED: 'danger',
};

const RUN_STATUS_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'default' | 'primary'> = {
  SUCCESS: 'success',
  FAILED: 'danger',
  TIMEOUT: 'warning',
  SKIPPED: 'default',
  RUNNING: 'primary',
};

// ── Filter config ────────────────────────────────────────

const CRON_FILTER_CONFIG = {
  sections: [
    {
      title: 'Cron Job Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'status',
          options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'PAUSED', label: 'Paused' },
            { value: 'DISABLED', label: 'Disabled' },
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

export function CronJobList() {
  const { data: response, isLoading } = useCronJobs();
  const { data: dashboardData } = useCronDashboard();
  const toggleMutation = useToggleCronJob();
  const runMutation = useRunCronJob();
  const reloadMutation = useReloadCrons();

  const [runningJobCode, setRunningJobCode] = useState<string | null>(null);

  const { handleRowEdit } = useEntityPanel({
    entityKey: 'cron-job',
    entityLabel: 'Cron Job',
    FormComponent: CronJobEditForm,
    idProp: 'cronJobCode',
    editRoute: '/settings/cron-jobs/:id',
    createRoute: '/settings/cron-jobs/new',
    displayField: 'jobName',
  });

  const { openContent } = useContentPanel();

  const records = useMemo(() => {
    const raw = (response as any)?.data ?? response ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [response]);

  const dashboard = (dashboardData as any)?.data ?? dashboardData;

  const tableData = useMemo(
    () =>
      records.map((job: CronJob) => ({
        id: job.jobCode,
        jobName: job.jobName,
        jobCode: job.jobCode,
        cronExpression: job.cronExpression,
        moduleName: job.moduleName,
        status: job.status,
        lastRunStatus: job.lastRunStatus ?? '—',
        lastRunAt: job.lastRunAt
          ? new Date(job.lastRunAt).toLocaleString()
          : '—',
        nextRunAt: job.nextRunAt
          ? new Date(job.nextRunAt).toLocaleString()
          : '—',
        duration: formatDuration(job.avgDurationMs),
        totalRunCount: job.totalRunCount,
        successRate: job.successRate != null ? `${job.successRate}%` : '—',
      })),
    [records],
  );

  const handleToggle = useCallback(
    async (row: any) => {
      const currentStatus = records.find((j: CronJob) => j.jobCode === row.id)?.status;
      const newStatus: CronJobStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      try {
        await toggleMutation.mutateAsync({
          jobCode: row.id,
          data: { status: newStatus },
        });
        toast.success(`Job ${newStatus === 'ACTIVE' ? 'resumed' : 'paused'}`);
      } catch {
        toast.error('Failed to toggle job');
      }
    },
    [toggleMutation, records],
  );

  const handleRunNow = useCallback(
    async (row: any) => {
      setRunningJobCode(row.id);
      try {
        await runMutation.mutateAsync(row.id);
        toast.success('Job triggered');
      } catch {
        toast.error('Failed to run job');
      } finally {
        setRunningJobCode(null);
      }
    },
    [runMutation],
  );

  const handleViewHistory = useCallback(
    (row: any) => {
      openContent({
        id: `cron-history-${row.id}`,
        title: `${row.jobName} — Run History`,
        content: <CronJobHistory jobCode={row.id} />,
        width: 800,
      });
    },
    [openContent],
  );

  const handleReloadAll = useCallback(async () => {
    try {
      await reloadMutation.mutateAsync();
      toast.success('All cron jobs reloaded');
    } catch {
      toast.error('Failed to reload');
    }
  }, [reloadMutation]);

  if (isLoading) return <TableSkeleton title="Scheduled Jobs" />;

  return (
    <div className="h-full flex flex-col">
      {/* Dashboard Cards */}
      {dashboard && (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {dashboard.totalJobs ?? 0}
            </p>
            <p className="text-xs text-gray-500">Total Jobs</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-green-600">
              {dashboard.activeJobs ?? 0}
            </p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-red-600">
              {dashboard.failedLast24h ?? 0}
            </p>
            <p className="text-xs text-gray-500">Failed (24h)</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-blue-600">
              {dashboard.successRate != null ? `${dashboard.successRate}%` : '—'}
            </p>
            <p className="text-xs text-gray-500">Success Rate</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0">
        <TableFull
          title="Scheduled Jobs"
          tableKey="cron-jobs"
          data={tableData}
          columns={CRON_COLUMNS}
          defaultViewMode="table"
          defaultDensity="comfortable"
          filterConfig={CRON_FILTER_CONFIG}
          onRowEdit={handleRowEdit}
          headerActions={
            <>
              <HelpButton
                panelId="cron-config-help"
                title="Cron Jobs — Help"
                userContent={<CronConfigUserHelp />}
                devContent={<CronConfigDevHelp />}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleReloadAll}
                disabled={reloadMutation.isPending}
              >
                <Icon name="refresh-cw" size={14} />
                Reload All
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}
