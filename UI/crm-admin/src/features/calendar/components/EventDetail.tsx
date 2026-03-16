'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button, Icon, Badge, Card, Modal, DatePicker, TextareaInput } from '@/components/ui';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/format-date';

import {
  useCalendarEvent,
  useDeleteEvent,
  useRescheduleEvent,
  useRSVP,
} from '../hooks/useCalendar';
import { calendarService } from '../services/calendar.service';
import type { RSVPStatus } from '../types/calendar.types';

// ── Constants ─────────────────────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  MEETING: '#3b82f6',
  CALL: '#10b981',
  DEMO: '#f59e0b',
  TASK: '#6366f1',
  REMINDER: '#ef4444',
  BLOCK: '#6b7280',
  OTHER: '#8b5cf6',
};

const RSVP_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  ACCEPTED: 'success',
  TENTATIVE: 'warning',
  DECLINED: 'danger',
  PENDING: 'secondary',
};

// ── Props ─────────────────────────────────────────────────────────────

interface EventDetailProps {
  eventId: string;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────

export function EventDetail({ eventId, onClose }: EventDetailProps) {
  const { data, isLoading, error } = useCalendarEvent(eventId);
  const deleteMutation = useDeleteEvent();
  const rescheduleMutation = useRescheduleEvent();
  const rsvpMutation = useRSVP();

  const [showReschedule, setShowReschedule] = useState(false);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [history, setHistory] = useState<unknown[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const event = data?.data;

  // ── Handlers ──────────────────────────────────────────────────────

  async function handleDelete() {
    if (!event) return;
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteMutation.mutateAsync(event.id);
      toast.success('Event deleted');
      onClose();
    } catch {
      toast.error('Failed to delete event');
    }
  }

  async function handleReschedule() {
    if (!event || !newStart || !newEnd) {
      toast.error('Please select new start and end times');
      return;
    }
    try {
      await rescheduleMutation.mutateAsync({
        id: event.id,
        dto: { startTime: newStart, endTime: newEnd, reason: rescheduleReason || undefined },
      });
      toast.success('Event rescheduled');
      setShowReschedule(false);
    } catch {
      toast.error('Failed to reschedule event');
    }
  }

  async function handleRSVP(status: RSVPStatus) {
    if (!event) return;
    try {
      await rsvpMutation.mutateAsync({ id: event.id, dto: { status } });
      toast.success(`RSVP updated to ${status}`);
    } catch {
      toast.error('Failed to update RSVP');
    }
  }

  async function handleLoadHistory() {
    if (!event) return;
    setHistoryLoading(true);
    try {
      const res = await calendarService.getEventHistory(event.id);
      setHistory((res as any)?.data ?? []);
      setShowHistory(true);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Icon name="alert-circle" size={32} />
        <p style={{ marginTop: 8, color: '#6b7280' }}>Event not found.</p>
        <Button variant="outline" onClick={onClose} style={{ marginTop: 12 }}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{event.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <Badge
              variant="primary"
              style={{ backgroundColor: EVENT_TYPE_COLORS[event.type] || '#6b7280' }}
            >
              {event.type}
            </Badge>
            {event.isCancelled && <Badge variant="danger">Cancelled</Badge>}
            {event.isRecurring && <Badge variant="secondary">Recurring</Badge>}
          </div>
        </div>
        <Button variant="ghost" onClick={onClose} style={{ padding: 4 }}>
          <Icon name="x" size={20} />
        </Button>
      </div>

      {/* Date / Time */}
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 4 }}>Start</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {event.isAllDay
                ? formatDate(event.startTime, 'dd MMM yyyy') + ' (All day)'
                : formatDate(event.startTime, 'dd MMM yyyy, hh:mm a')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 4 }}>End</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {event.isAllDay
                ? formatDate(event.endTime, 'dd MMM yyyy')
                : formatDate(event.endTime, 'dd MMM yyyy, hh:mm a')}
            </div>
          </div>
        </div>
      </Card>

      {/* Location */}
      {event.location && (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="map-pin" size={16} />
            <span style={{ fontSize: 14 }}>{event.location}</span>
          </div>
        </Card>
      )}

      {/* Meeting URL */}
      {event.meetingUrl && (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="link" size={16} />
            <a
              href={event.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'underline' }}
            >
              {event.meetingUrl}
            </a>
          </div>
        </Card>
      )}

      {/* Description */}
      {event.description && (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 6 }}>Description</div>
          <p style={{ fontSize: 14, color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>
            {event.description}
          </p>
        </Card>
      )}

      {/* Attendees */}
      {event.attendees.length > 0 && (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="users" size={16} />
            Attendees ({event.attendees.length})
          </h3>
          {event.attendees.map((att, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: idx < event.attendees.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{att.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{att.email}</span>
              </div>
              <Badge variant={RSVP_BADGE_VARIANT[att.rsvpStatus] ?? 'secondary'}>
                {att.rsvpStatus}
              </Badge>
            </div>
          ))}
        </Card>
      )}

      {/* Reminders */}
      {event.reminders.length > 0 && (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="bell" size={16} />
            Reminders
          </h3>
          {event.reminders.map((rem, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 0',
              }}
            >
              <Icon name={rem.type === 'EMAIL' ? 'mail' : rem.type === 'SMS' ? 'phone' : 'bell'} size={14} />
              <span style={{ fontSize: 13 }}>
                {rem.type} - {rem.minutesBefore} min before
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* RSVP Section */}
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>Your RSVP</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="primary"
            onClick={() => handleRSVP('ACCEPTED')}
            disabled={rsvpMutation.isPending}
          >
            <Icon name="check" size={14} />
            Accept
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRSVP('TENTATIVE')}
            disabled={rsvpMutation.isPending}
          >
            <Icon name="help-circle" size={14} />
            Tentative
          </Button>
          <Button
            variant="danger"
            onClick={() => handleRSVP('DECLINED')}
            disabled={rsvpMutation.isPending}
          >
            <Icon name="x" size={14} />
            Decline
          </Button>
        </div>
      </Card>

      {/* Reschedule Section */}
      {showReschedule && (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>Reschedule Event</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <DatePicker
              label="New Start"
              value={newStart}
              onChange={(v) => setNewStart(v as string)}
            />
            <DatePicker
              label="New End"
              value={newEnd}
              onChange={(v) => setNewEnd(v as string)}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <TextareaInput
              label="Reason"
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              rows={2}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" onClick={handleReschedule} disabled={rescheduleMutation.isPending}>
              Confirm Reschedule
            </Button>
            <Button variant="outline" onClick={() => setShowReschedule(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* History Timeline */}
      {showHistory && history.length > 0 && (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="clock" size={16} />
            History
          </h3>
          {history.map((entry: any, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 12,
                padding: '8px 0',
                borderBottom: idx < history.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{entry.action ?? 'Event updated'}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {entry.timestamp ? formatDate(entry.timestamp, 'dd MMM yyyy, hh:mm a') : ''}
                  {entry.userName && ` by ${entry.userName}`}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
        <Button variant="outline" onClick={() => setShowReschedule(!showReschedule)}>
          <Icon name="calendar" size={14} />
          Reschedule
        </Button>
        <Button
          variant="outline"
          onClick={handleLoadHistory}
          disabled={historyLoading}
        >
          <Icon name="clock" size={14} />
          History
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
          <Icon name="trash-2" size={14} />
          Delete
        </Button>
      </div>
    </div>
  );
}
