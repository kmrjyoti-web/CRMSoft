'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { Badge, Button, Icon } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useConfirmDialog } from '@/components/common/useConfirmDialog';
import { useReportSchedules, useUpdateSchedule, useDeleteSchedule } from '../hooks/useReports';
import type { ScheduledReport, ScheduleStatus } from '../types/report.types';

function getStatusBadge(status: ScheduleStatus) {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'PAUSED': return 'warning';
    case 'CANCELLED': return 'danger';
    default: return 'default';
  }
}

export function ReportScheduleList() {
  const { data, isLoading } = useReportSchedules();
  const updateMut = useUpdateSchedule();
  const deleteMut = useDeleteSchedule();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const schedules: ScheduledReport[] = data?.data ?? [];

  const handleToggle = useCallback(async (schedule: ScheduledReport) => {
    const newStatus = schedule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await updateMut.mutateAsync({ id: schedule.id, payload: { status: newStatus } });
      toast.success(`Schedule ${newStatus === 'ACTIVE' ? 'activated' : 'paused'}`);
    } catch {
      toast.error('Failed to update schedule');
    }
  }, [updateMut]);

  const handleDelete = useCallback(async (schedule: ScheduledReport) => {
    const ok = await confirm({
      title: 'Cancel Schedule',
      message: `Cancel "${schedule.name}"? This will stop future deliveries.`,
      type: 'danger',
      confirmText: 'Cancel Schedule',
    });
    if (!ok) return;
    try {
      await deleteMut.mutateAsync(schedule.id);
      toast.success('Schedule cancelled');
    } catch {
      toast.error('Failed to cancel schedule');
    }
  }, [confirm, deleteMut]);

  if (isLoading) return <LoadingSpinner />;

  if (schedules.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="No scheduled reports"
        description="Create a schedule to automatically generate and email reports."
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-800">{schedule.name}</h4>
                  <Badge variant={getStatusBadge(schedule.status) as any}>
                    {schedule.status}
                  </Badge>
                  <Badge variant="outline">{schedule.format}</Badge>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {schedule.reportDef?.name ?? 'Unknown Report'}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Icon name="clock" size={12} />
                    {schedule.frequency} at {schedule.timeOfDay}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="mail" size={12} />
                    {schedule.recipientEmails.length} recipient(s)
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="send" size={12} />
                    {schedule.sendCount} sent
                  </span>
                  {schedule.nextScheduledAt && (
                    <span className="flex items-center gap-1">
                      <Icon name="calendar" size={12} />
                      Next: {new Date(schedule.nextScheduledAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {schedule.lastError && (
                  <p className="text-xs text-red-500 mt-1">
                    Last error: {schedule.lastError}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggle(schedule)}
                  disabled={schedule.status === 'CANCELLED'}
                >
                  <Icon
                    name={schedule.status === 'ACTIVE' ? 'pause' : 'play'}
                    size={14}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(schedule)}
                >
                  <Icon name="trash-2" size={14} className="text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialogPortal />
    </>
  );
}
