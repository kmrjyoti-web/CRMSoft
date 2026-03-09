'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { Button, Icon, Input, Modal, SelectInput, Switch, DatePicker } from '@/components/ui';

import { useCreateEvent, useUpdateEvent } from '../hooks/useCalendar';
import type {
  CalendarEvent,
  CreateEventDto,
  EventType,
  EventAttendee,
  EventReminder,
} from '../types/calendar.types';

// ── Constants ─────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS = [
  { value: 'MEETING', label: 'Meeting' },
  { value: 'CALL', label: 'Call' },
  { value: 'DEMO', label: 'Demo' },
  { value: 'TASK', label: 'Task' },
  { value: 'REMINDER', label: 'Reminder' },
  { value: 'BLOCK', label: 'Block' },
  { value: 'OTHER', label: 'Other' },
];

const REMINDER_TYPE_OPTIONS = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'NOTIFICATION', label: 'Notification' },
  { value: 'SMS', label: 'SMS' },
];

// ── Props ─────────────────────────────────────────────────────────────

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  event?: CalendarEvent;
  defaultDate?: string;
}

// ── Component ─────────────────────────────────────────────────────────

export function EventForm({ open, onClose, event, defaultDate }: EventFormProps) {
  const isEdit = !!event;

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  // ── Form state ────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('MEETING');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [description, setDescription] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');

  // Attendees
  const [attendees, setAttendees] = useState<Omit<EventAttendee, 'rsvpStatus'>[]>([]);
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeeName, setAttendeeName] = useState('');

  // Reminders
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [reminderType, setReminderType] = useState<EventReminder['type']>('NOTIFICATION');
  const [reminderMinutes, setReminderMinutes] = useState(15);

  // ── Populate on edit ──────────────────────────────────────────────
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setType(event.type);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setIsAllDay(event.isAllDay);
      setLocation(event.location ?? '');
      setMeetingUrl(event.meetingUrl ?? '');
      setDescription(event.description ?? '');
      setEntityType(event.entityType ?? '');
      setEntityId(event.entityId ?? '');
      setAttendees(
        event.attendees.map((a) => ({ email: a.email, name: a.name, isOptional: a.isOptional })),
      );
      setReminders(event.reminders ?? []);
    } else {
      resetForm();
      if (defaultDate) {
        setStartTime(defaultDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, defaultDate, open]);

  function resetForm() {
    setTitle('');
    setType('MEETING');
    setStartTime('');
    setEndTime('');
    setIsAllDay(false);
    setLocation('');
    setMeetingUrl('');
    setDescription('');
    setEntityType('');
    setEntityId('');
    setAttendees([]);
    setReminders([]);
    setAttendeeEmail('');
    setAttendeeName('');
    setReminderType('NOTIFICATION');
    setReminderMinutes(15);
  }

  // ── Handlers ──────────────────────────────────────────────────────

  function handleAddAttendee() {
    if (!attendeeEmail.trim()) return;
    setAttendees((prev) => [
      ...prev,
      { email: attendeeEmail.trim(), name: attendeeName.trim(), isOptional: false },
    ]);
    setAttendeeEmail('');
    setAttendeeName('');
  }

  function handleRemoveAttendee(index: number) {
    setAttendees((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddReminder() {
    setReminders((prev) => [...prev, { type: reminderType, minutesBefore: reminderMinutes }]);
    setReminderType('NOTIFICATION');
    setReminderMinutes(15);
  }

  function handleRemoveReminder(index: number) {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!startTime || !endTime) {
      toast.error('Start and end time are required');
      return;
    }

    const dto: CreateEventDto = {
      title: title.trim(),
      type,
      startTime,
      endTime,
      isAllDay,
      location: location || undefined,
      meetingUrl: meetingUrl || undefined,
      description: description || undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      attendees: attendees.length > 0 ? attendees : undefined,
      reminders: reminders.length > 0 ? reminders : undefined,
    };

    try {
      if (isEdit && event) {
        await updateMutation.mutateAsync({ id: event.id, dto });
        toast.success('Event updated');
      } else {
        await createMutation.mutateAsync(dto);
        toast.success('Event created');
      }
      onClose();
    } catch {
      toast.error(isEdit ? 'Failed to update event' : 'Failed to create event');
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Render ────────────────────────────────────────────────────────

  return (
    <Modal visible={open} onClose={onClose} size="lg">
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            {isEdit ? 'Edit Event' : 'Create Event'}
          </h2>
          <Button variant="ghost" onClick={onClose} style={{ padding: 4 }}>
            <Icon name="x" size={20} />
          </Button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <Input
            label="Title"
            leftIcon={<Icon name="type" size={16} />}
            value={title}
            onChange={(v: string) => setTitle(v)}
          />
        </div>

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <SelectInput
            label="Event Type"
            leftIcon={<Icon name="tag" size={16} />}
            options={EVENT_TYPE_OPTIONS}
            value={type}
            onChange={(v) => setType(v as EventType)}
          />
        </div>

        {/* All Day Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Switch
            label="All Day"
            checked={isAllDay}
            onChange={(checked: boolean) => setIsAllDay(checked)}
          />
        </div>

        {/* Start / End Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <DatePicker
            label="Start Time"
            value={startTime}
            onChange={(v) => setStartTime(v as string)}
          />
          <DatePicker
            label="End Time"
            value={endTime}
            onChange={(v) => setEndTime(v as string)}
          />
        </div>

        {/* Location */}
        <div style={{ marginBottom: 16 }}>
          <Input
            label="Location"
            leftIcon={<Icon name="map-pin" size={16} />}
            value={location}
            onChange={(v: string) => setLocation(v)}
          />
        </div>

        {/* Meeting URL */}
        <div style={{ marginBottom: 16 }}>
          <Input
            label="Meeting URL"
            leftIcon={<Icon name="link" size={16} />}
            value={meetingUrl}
            onChange={(v: string) => setMeetingUrl(v)}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              fontSize: 14,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Entity Linking (Optional) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <Input
            label="Entity Type"
            leftIcon={<Icon name="layers" size={16} />}
            value={entityType}
            onChange={(v: string) => setEntityType(v)}
          />
          <Input
            label="Entity ID"
            leftIcon={<Icon name="hash" size={16} />}
            value={entityId}
            onChange={(v: string) => setEntityId(v)}
          />
        </div>

        {/* ── Attendees Section ──────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="users" size={16} />
              Attendees
            </h3>
          </div>

          {/* Attendee list */}
          {attendees.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {attendees.map((att, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: 6,
                    marginBottom: 4,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{att.name || 'No name'}</span>
                    <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{att.email}</span>
                  </div>
                  <Button variant="ghost" onClick={() => handleRemoveAttendee(idx)} style={{ padding: 4 }}>
                    <Icon name="x" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add attendee inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
            <Input
              label="Email"
              leftIcon={<Icon name="mail" size={16} />}
              value={attendeeEmail}
              onChange={(v: string) => setAttendeeEmail(v)}
            />
            <Input
              label="Name"
              leftIcon={<Icon name="user" size={16} />}
              value={attendeeName}
              onChange={(v: string) => setAttendeeName(v)}
            />
            <Button variant="outline" onClick={handleAddAttendee} style={{ alignSelf: 'end', height: 38 }}>
              <Icon name="plus" size={16} />
            </Button>
          </div>
        </div>

        {/* ── Reminders Section ─────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="bell" size={16} />
              Reminders
            </h3>
          </div>

          {/* Reminder list */}
          {reminders.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {reminders.map((rem, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: 6,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 13 }}>
                    {rem.type} - {rem.minutesBefore} min before
                  </span>
                  <Button variant="ghost" onClick={() => handleRemoveReminder(idx)} style={{ padding: 4 }}>
                    <Icon name="x" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add reminder inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
            <SelectInput
              label="Reminder Type"
              options={REMINDER_TYPE_OPTIONS}
              value={reminderType}
              onChange={(v) => setReminderType(v as EventReminder['type'])}
            />
            <Input
              label="Minutes Before"
              leftIcon={<Icon name="clock" size={16} />}
              value={String(reminderMinutes)}
              onChange={(v: string) => setReminderMinutes(Number(v) || 0)}
            />
            <Button variant="outline" onClick={handleAddReminder} style={{ alignSelf: 'end', height: 38 }}>
              <Icon name="plus" size={16} />
            </Button>
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Icon name="loader" size={16} />}
            {isEdit ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
