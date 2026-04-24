'use client';

import { Icon, Badge } from '@/components/ui';
import { formatDate } from '@/lib/format-date';
import { useActivityDetail } from '@/features/activities/hooks/useActivities';

import {
  SOURCE_LABELS,
  SOURCE_COLORS,
  type CalendarSource,
} from '../types/calendar.types';

// -- Activity type helpers ---------------------------------------------------

const ACTIVITY_TYPE_ICON: Record<string, string> = {
  CALL: 'phone',
  EMAIL: 'mail',
  MEETING: 'calendar',
  NOTE: 'edit',
  WHATSAPP: 'phone',
  SMS: 'send',
  VISIT: 'map-pin',
};

// -- Props -------------------------------------------------------------------

interface CalendarEventPanelProps {
  source: CalendarSource;
  sourceId: string;
  row: Record<string, any>;
}

// -- Component ---------------------------------------------------------------

export function CalendarEventPanel({ source, sourceId, row }: CalendarEventPanelProps) {
  if (source === 'ACTIVITY') {
    return <ActivityEventDetail sourceId={sourceId} row={row} />;
  }

  // Generic detail for TASK, DEMO, TOUR_PLAN, REMINDER, FOLLOW_UP, etc.
  return <GenericEventDetail source={source} row={row} />;
}

// -- Activity Detail (fetches full data) ------------------------------------

function ActivityEventDetail({ sourceId, row }: { sourceId: string; row: Record<string, any> }) {
  const { data, isLoading } = useActivityDetail(sourceId);
  const activity = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Icon name="activity" size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Activity details not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Source badge */}
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: SOURCE_COLORS.ACTIVITY }}
        />
        <span className="text-xs font-medium text-gray-500">Activity</span>
      </div>

      {/* Activity Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name={ACTIVITY_TYPE_ICON[activity.type] || 'activity'} size={16} className="text-gray-500" />
          <Badge variant="primary">{activity.type}</Badge>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-2">{activity.subject}</h3>

        {activity.description && (
          <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{activity.description}</p>
        )}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-400">Scheduled At</dt>
            <dd className="mt-0.5 font-medium text-gray-700">
              {activity.scheduledAt ? formatDate(activity.scheduledAt, 'dd MMM yyyy, hh:mm a') : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Duration</dt>
            <dd className="mt-0.5 font-medium text-gray-700">
              {activity.duration != null ? `${activity.duration} mins` : '—'}
            </dd>
          </div>
          {activity.endTime && (
            <div>
              <dt className="text-xs text-gray-400">End Time</dt>
              <dd className="mt-0.5 font-medium text-gray-700">
                {formatDate(activity.endTime, 'dd MMM yyyy, hh:mm a')}
              </dd>
            </div>
          )}
          {activity.locationName && (
            <div>
              <dt className="text-xs text-gray-400">Location</dt>
              <dd className="mt-0.5 font-medium text-gray-700 flex items-center gap-1">
                <Icon name="map-pin" size={12} className="text-gray-400" />
                {activity.locationName}
              </dd>
            </div>
          )}
        </dl>

        {activity.outcome && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <dt className="text-xs text-gray-400 mb-0.5">Outcome</dt>
            <dd className="text-sm text-gray-700 whitespace-pre-wrap">{activity.outcome}</dd>
          </div>
        )}

        {activity.completedAt && (
          <div className="mt-2">
            <Badge variant="success">Completed {formatDate(activity.completedAt, 'dd MMM yyyy')}</Badge>
          </div>
        )}
      </div>

      {/* Lead Info Card */}
      {activity.lead && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2 flex items-center gap-1.5">
            <Icon name="trending-up" size={12} />
            Lead
          </h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Lead Number</dt>
              <dd className="font-medium text-blue-600">{activity.lead.leadNumber}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Contact Info Card */}
      {activity.contact && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2 flex items-center gap-1.5">
            <Icon name="user" size={12} />
            Contact
          </h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">
                {activity.contact.firstName} {activity.contact.lastName}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Created By */}
      {activity.createdBy && (
        <div className="text-xs text-gray-400 pt-2">
          Created by {activity.createdBy.firstName} {activity.createdBy.lastName} · {formatDate(activity.createdAt, 'dd MMM yyyy')}
        </div>
      )}
    </div>
  );
}

// -- Generic Event Detail (uses row data) -----------------------------------

function GenericEventDetail({ source, row }: { source: CalendarSource; row: Record<string, any> }) {
  const sourceLabel = SOURCE_LABELS[source] ?? source;
  const sourceColor = SOURCE_COLORS[source] ?? '#6B7280';

  return (
    <div className="p-4 space-y-4">
      {/* Source badge */}
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: sourceColor }}
        />
        <span className="text-xs font-medium text-gray-500">{sourceLabel}</span>
      </div>

      {/* Event Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{row.title || '—'}</h3>

        {row.description && (
          <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{row.description}</p>
        )}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-400">Date / Time</dt>
            <dd className="mt-0.5 font-medium text-gray-700">
              {row.startTime
                ? row.allDay
                  ? formatDate(row.startTime, 'dd MMM yyyy') + ' (All day)'
                  : formatDate(row.startTime, 'dd MMM yyyy, hh:mm a')
                : '—'}
            </dd>
          </div>

          {row.endTime && (
            <div>
              <dt className="text-xs text-gray-400">End Time</dt>
              <dd className="mt-0.5 font-medium text-gray-700">
                {formatDate(row.endTime, 'dd MMM yyyy, hh:mm a')}
              </dd>
            </div>
          )}

          {row.status && (
            <div>
              <dt className="text-xs text-gray-400">Status</dt>
              <dd className="mt-0.5">
                <Badge variant="outline">{row.status}</Badge>
              </dd>
            </div>
          )}

          {row.priority && (
            <div>
              <dt className="text-xs text-gray-400">Priority</dt>
              <dd className="mt-0.5">
                <Badge variant={row.priority === 'HIGH' || row.priority === 'URGENT' ? 'warning' : 'secondary'}>
                  {row.priority}
                </Badge>
              </dd>
            </div>
          )}

          {row.userName && (
            <div>
              <dt className="text-xs text-gray-400">Assigned To</dt>
              <dd className="mt-0.5 font-medium text-gray-700 flex items-center gap-1">
                <Icon name="user" size={12} className="text-gray-400" />
                {row.userName}
              </dd>
            </div>
          )}

          {row.location && (
            <div>
              <dt className="text-xs text-gray-400">Location</dt>
              <dd className="mt-0.5 font-medium text-gray-700 flex items-center gap-1">
                <Icon name="map-pin" size={12} className="text-gray-400" />
                {row.location}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
