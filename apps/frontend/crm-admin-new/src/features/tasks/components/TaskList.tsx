'use client';

import { useMemo } from 'react';

import { TableFull } from '@/components/ui';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { useTableFilters } from '@/hooks/useTableFilters';
import { useEntityPanel } from '@/hooks/useEntityPanel';
import { formatDate } from '@/lib/format-date';

import {
  useTasksList,
  useDeleteTask,
  useApproveTask,
  useRejectTask,
} from '../hooks/useTasks';
import { HelpButton } from '@/components/common/HelpButton';

import { TaskForm } from './TaskForm';
import { TaskListUserHelp } from '../help/TaskListUserHelp';
import { TaskListDevHelp } from '../help/TaskListDevHelp';
import type { TaskListItem, TaskListParams } from '../types/tasks.types';

// -- Columns ------------------------------------------------------------------

const TASK_COLUMNS = [
  { id: 'taskNumber', label: 'Task #', visible: true },
  { id: 'title', label: 'Title', visible: true },
  { id: 'type', label: 'Type', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'priority', label: 'Priority', visible: true },
  { id: 'assignedTo', label: 'Assigned To', visible: true },
  { id: 'dueDate', label: 'Due Date', visible: true },
  { id: 'createdAt', label: 'Created', visible: false },
  { id: 'estimatedMinutes', label: 'Est. Minutes', visible: false },
  { id: 'tags', label: 'Tags', visible: false },
];

// -- Status colors ------------------------------------------------------------

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN:             { bg: '#EBF5FF', text: '#2563EB' },
  IN_PROGRESS:      { bg: '#FEF6E6', text: '#D97706' },
  COMPLETED:        { bg: '#E8F8EE', text: '#16A34A' },
  CANCELLED:        { bg: '#F3F4F6', text: '#6B7280' },
  ON_HOLD:          { bg: '#F3E8FD', text: '#7C3AED' },
  OVERDUE:          { bg: '#FDE8E8', text: '#DC2626' },
  PENDING_APPROVAL: { bg: '#FFF7ED', text: '#EA580C' },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  LOW:      { bg: '#F3F4F6', text: '#6B7280' },
  MEDIUM:   { bg: '#EBF5FF', text: '#2563EB' },
  HIGH:     { bg: '#FEF6E6', text: '#D97706' },
  URGENT:   { bg: '#FDE8E8', text: '#DC2626' },
  CRITICAL: { bg: '#FDE8E8', text: '#991B1B' },
};

// -- Filter config ------------------------------------------------------------

const TASK_FILTER_CONFIG = {
  sections: [
    {
      title: 'Task Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'status',
          options: [
            { value: 'OPEN', label: 'Open' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'ON_HOLD', label: 'On Hold' },
            { value: 'OVERDUE', label: 'Overdue' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ],
        },
        {
          columnId: 'priority',
          label: 'Priority',
          filterType: 'master' as const,
          queryParam: 'priority',
          options: [
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'URGENT', label: 'Urgent' },
            { value: 'CRITICAL', label: 'Critical' },
          ],
        },
        {
          columnId: 'type',
          label: 'Type',
          filterType: 'master' as const,
          queryParam: 'type',
          options: [
            { value: 'GENERAL', label: 'General' },
            { value: 'FOLLOW_UP', label: 'Follow-up' },
            { value: 'CALL_BACK', label: 'Call Back' },
            { value: 'MEETING', label: 'Meeting' },
            { value: 'DEMO', label: 'Demo' },
            { value: 'APPROVAL', label: 'Approval' },
            { value: 'REVIEW', label: 'Review' },
          ],
        },
        { columnId: 'dueDate', label: 'Due Date', filterType: 'date' as const, queryParam: 'dueDate' },
      ],
    },
  ],
};

// -- Component ----------------------------------------------------------------

export function TaskList() {
  const { filterParams } = useTableFilters(TASK_FILTER_CONFIG);

  const params: TaskListParams = {
    ...filterParams,
    limit: 100,
  };

  const { data: response, isLoading } = useTasksList(params);
  const deleteTask = useDeleteTask();
  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: 'task',
    entityLabel: 'Task',
    FormComponent: TaskForm,
    idProp: 'taskId',
    editRoute: '/tasks/:id',
    createRoute: '/tasks/new',
    displayField: 'title',
  });

  const records = (response as any)?.data ?? (response as any) ?? [];

  // Flatten for TableFull
  const tableData = useMemo(() => {
    if (!Array.isArray(records)) return [];
    return records.map((t: TaskListItem) => ({
      id: t.id,
      taskNumber: t.taskNumber,
      title: t.title,
      type: t.type?.replace(/_/g, ' ') ?? '',
      status: t.status,
      priority: t.priority,
      assignedTo: t.assignedTo
        ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}`.trim()
        : '—',
      dueDate: t.dueDate ? formatDate(t.dueDate, 'dd MMM yyyy') : '—',
      createdAt: formatDate(t.createdAt, 'dd MMM yyyy'),
      estimatedMinutes: t.estimatedMinutes ?? '—',
      tags: t.tags?.join(', ') ?? '',
      _raw: t,
    }));
  }, [records]);

  const handleRowDelete = (row: any) => {
    if (confirm(`Delete task "${row.title}"?`)) {
      deleteTask.mutate(row.id);
    }
  };

  const handleApprove = (row: any) => {
    if (confirm(`Approve task "${row.title}"?`)) {
      approveTask.mutate(row.id);
    }
  };

  const handleReject = (row: any) => {
    const reason = prompt(`Reject task "${row.title}"? Enter reason (optional):`);
    if (reason !== null) {
      rejectTask.mutate({ id: row.id, reason: reason || undefined });
    }
  };

  // Build row actions dynamically — add Approve/Reject for PENDING_APPROVAL tasks
  const rowActions = (row: any) => {
    const actions: { label: string; icon: string; onClick: () => void; variant?: string }[] = [];

    if (row.status === 'PENDING_APPROVAL') {
      actions.push(
        { label: 'Approve', icon: 'check-circle', onClick: () => handleApprove(row), variant: 'success' },
        { label: 'Reject', icon: 'x-circle', onClick: () => handleReject(row), variant: 'danger' },
      );
    }

    return actions;
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <TableFull
      title="Tasks"
      tableKey="tasks"
      data={tableData}
      columns={TASK_COLUMNS}
      defaultViewMode="table"
      defaultDensity="comfortable"
      filterConfig={TASK_FILTER_CONFIG}
      onRowEdit={handleRowEdit}
      onRowDelete={handleRowDelete}
      onCreate={handleCreate}
      rowActions={rowActions}
      headerActions={
        <HelpButton
          panelId="tasks-list-help"
          title="Tasks — Help"
          userContent={<TaskListUserHelp />}
          devContent={<TaskListDevHelp />}
        />
      }
    />
  );
}
