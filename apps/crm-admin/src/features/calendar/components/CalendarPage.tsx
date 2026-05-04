'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { TableFull } from '@/components/ui';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { ColorBadge } from '@/components/common/ColorBadge';
import { formatDate } from '@/lib/format-date';
import { useSidePanelStore } from '@/stores/side-panel.store';

import { useUnifiedCalendar, useCalendarStats } from '../hooks/useCalendar';
import { CalendarEventPanel } from './CalendarEventPanel';
import {
  SOURCE_LABELS,
  SOURCE_COLORS,
  type CalendarSource,
  type UnifiedCalendarEvent,
} from '../types/calendar.types';

// -- Columns ------------------------------------------------------------------

const CALENDAR_COLUMNS = [
  { id: 'title', label: 'Title', visible: true },
  { id: 'source', label: 'Source', visible: true },
  { id: 'startTime', label: 'Date / Time', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'userName', label: 'Assigned To', visible: true },
  { id: 'location', label: 'Location', visible: false },
  { id: 'description', label: 'Description', visible: false },
  { id: 'priority', label: 'Priority', visible: false },
  { id: 'endTime', label: 'End Time', visible: false },
];

// -- Source badge color map for ColorBadge ------------------------------------

const SOURCE_BADGE_MAP: Record<string, { bg: string; text: string }> = {
  TASK:            { bg: '#E8F0FE', text: '#4A90D9' },
  ACTIVITY:        { bg: '#E8F8EE', text: '#27AE60' },
  DEMO:            { bg: '#FEF0E6', text: '#E67E22' },
  TOUR_PLAN:       { bg: '#F3E8FD', text: '#8E44AD' },
  REMINDER:        { bg: '#FDE8E8', text: '#E74C3C' },
  FOLLOW_UP:       { bg: '#FEF6E6', text: '#F39C12' },
  SCHEDULED_EVENT: { bg: '#EAF2F8', text: '#2C3E50' },
};

// -- Helper: compute date range for ±3 months around today --------------------

function getDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 4, 0);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

// -- Component ----------------------------------------------------------------

export function CalendarPage() {
  const router = useRouter();
  const [dateRange] = useState(getDateRange);

  const { data: response, isLoading } = useUnifiedCalendar(dateRange);
  const { data: statsResponse } = useCalendarStats();

  const events = (response as any)?.data ?? (response as any) ?? [];
  const stats = (statsResponse as any)?.data ?? (statsResponse as any) ?? null;

  // Flatten events for TableFull — calendar view uses `startTime` as dateField
  const tableData = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.map((ev: UnifiedCalendarEvent) => ({
      id: ev.id,
      title: ev.title,
      source: ev.source,
      startTime: ev.startTime,
      endTime: ev.endTime ?? '',
      allDay: ev.allDay,
      color: ev.color ?? SOURCE_COLORS[ev.source as CalendarSource] ?? '#6B7280',
      userName: ev.userName ?? '',
      location: ev.location ?? '',
      description: ev.description ?? '',
      status: ev.status ?? '',
      priority: ev.priority ?? '',
      entityType: ev.entityType ?? '',
      entityId: ev.entityId ?? '',
      sourceId: ev.sourceId,
      editable: ev.editable,
      // Formatted fields for table view
      _sourceLabel: SOURCE_LABELS[ev.source as CalendarSource] ?? ev.source,
      _startFormatted: ev.allDay
        ? formatDate(ev.startTime, 'dd MMM yyyy') + ' (All day)'
        : formatDate(ev.startTime, 'dd MMM yyyy, hh:mm a'),
    }));
  }, [events]);

  // NOTE: Custom panel — not a standard CRUD flow (read-only event detail with navigation button)
  const openPanel = useSidePanelStore((s) => s.openPanel);
  const closePanel = useSidePanelStore((s) => s.closePanel);

  const navigateToEntity = useCallback((row: any) => {
    const source = row.source as CalendarSource;
    const id = row.sourceId;
    switch (source) {
      case 'TASK': router.push(`/tasks/${id}`); break;
      case 'ACTIVITY': router.push(`/activities/${id}`); break;
      case 'DEMO': router.push(`/demos/${id}`); break;
      case 'TOUR_PLAN': router.push(`/tour-plans/${id}`); break;
      case 'FOLLOW_UP': router.push(`/follow-ups/${id}`); break;
    }
  }, [router]);

  // Open side panel with event details on click
  const handleRowEdit = useCallback((row: any) => {
    const panelId = `calendar-event-${row.sourceId}`;
    openPanel({
      id: panelId,
      title: row.title || 'Event Details',
      width: 520,
      footerButtons: [
        { id: 'close', label: 'Close', showAs: 'text' as const, variant: 'secondary' as const, onClick: () => closePanel(panelId) },
        { id: 'view', label: 'View Full Details', icon: 'external-link', showAs: 'both' as const, variant: 'primary' as const, onClick: () => { closePanel(panelId); navigateToEntity(row); } },
      ],
      content: <CalendarEventPanel source={row.source} sourceId={row.sourceId} row={row} />,
    });
  }, [openPanel, closePanel, navigateToEntity]);

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="h-full flex flex-col">
      {/* Stats strip */}
      {stats && (
        <div className="flex gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
          <StatChip label="Today" count={stats.todayEvents} color="#4A90D9" />
          <StatChip label="This Week" count={stats.weekEvents} color="#27AE60" />
          <StatChip label="Overdue Tasks" count={stats.overdueTasks} color="#E74C3C" />
          <StatChip label="Pending RSVPs" count={stats.pendingRsvps} color="#F39C12" />
          {/* Source legend */}
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {(Object.keys(SOURCE_LABELS) as CalendarSource[]).map((src) => (
              <span key={src} className="flex items-center gap-1">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: SOURCE_COLORS[src] }}
                />
                {SOURCE_LABELS[src]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Unified table / calendar */}
      <div className="flex-1 min-h-0">
        <TableFull
          title="Calendar"
          tableKey="calendar"
          data={tableData}
          columns={CALENDAR_COLUMNS}
          defaultViewMode="calendar"
          defaultDensity="comfortable"
          defaultCalendarSettings={{ dateField: 'startTime', labelField: 'title' }}
          onRowEdit={handleRowEdit}
        />
      </div>
    </div>
  );
}

// -- Stat chip ----------------------------------------------------------------

function StatChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-gray-200">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{count}</span>
    </div>
  );
}
