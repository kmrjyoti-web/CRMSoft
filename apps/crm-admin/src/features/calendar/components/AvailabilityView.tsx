'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button, Icon, Card, Input, DatePicker, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/format-date';

import {
  useWorkingHours,
  useSetWorkingHours,
  useBlockedSlots,
  useDeleteBlockedSlot,
  useFindFreeSlots,
  useCheckConflicts,
} from '../hooks/useCalendar';
import type { WorkingHours, TimeSlot, CalendarEvent } from '../types/calendar.types';

// ── Constants ─────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Component ─────────────────────────────────────────────────────────

export function AvailabilityView() {
  const { data: whData, isLoading: whLoading } = useWorkingHours();
  const setWorkingHoursMut = useSetWorkingHours();
  const { data: blockedData, isLoading: blockedLoading } = useBlockedSlots();
  const deleteBlockedSlotMut = useDeleteBlockedSlot();
  const findFreeSlotsMut = useFindFreeSlots();
  const checkConflictsMut = useCheckConflicts();

  const workingHours: WorkingHours[] = (whData as any)?.data ?? [];
  const blockedSlots = (blockedData as any)?.data ?? [];

  // ── Edit working hours state ──────────────────────────────────────
  const [editingHours, setEditingHours] = useState(false);
  const [editedHours, setEditedHours] = useState<WorkingHours[]>([]);

  // ── Find free slots state ─────────────────────────────────────────
  const [freeUserIds, setFreeUserIds] = useState('');
  const [freeDateFrom, setFreeDateFrom] = useState('');
  const [freeDateTo, setFreeDateTo] = useState('');
  const [freeDuration, setFreeDuration] = useState(30);
  const [freeSlots, setFreeSlots] = useState<TimeSlot[]>([]);

  // ── Check conflicts state ─────────────────────────────────────────
  const [conflictUserIds, setConflictUserIds] = useState('');
  const [conflictStart, setConflictStart] = useState('');
  const [conflictEnd, setConflictEnd] = useState('');
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([]);

  // ── Handlers ──────────────────────────────────────────────────────

  function handleEditWorkingHours() {
    const initial: WorkingHours[] = Array.from({ length: 7 }, (_, i) => {
      const existing = workingHours.find((wh) => wh.dayOfWeek === i);
      return existing ?? { dayOfWeek: i, startTime: '09:00', endTime: '18:00', isWorkDay: i >= 1 && i <= 5 };
    });
    setEditedHours(initial);
    setEditingHours(true);
  }

  function handleUpdateHour(dayOfWeek: number, field: keyof WorkingHours, value: string | boolean) {
    setEditedHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h)),
    );
  }

  async function handleSaveWorkingHours() {
    try {
      await setWorkingHoursMut.mutateAsync(editedHours);
      toast.success('Working hours updated');
      setEditingHours(false);
    } catch {
      toast.error('Failed to update working hours');
    }
  }

  async function handleDeleteBlockedSlot(id: string) {
    try {
      await deleteBlockedSlotMut.mutateAsync(id);
      toast.success('Blocked slot removed');
    } catch {
      toast.error('Failed to remove blocked slot');
    }
  }

  async function handleFindFreeSlots() {
    if (!freeUserIds.trim() || !freeDateFrom || !freeDateTo) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const res = await findFreeSlotsMut.mutateAsync({
        userIds: freeUserIds.split(',').map((s) => s.trim()),
        dateFrom: freeDateFrom,
        dateTo: freeDateTo,
        durationMinutes: freeDuration,
      });
      setFreeSlots((res as any)?.data ?? []);
    } catch {
      toast.error('Failed to find free slots');
    }
  }

  async function handleCheckConflicts() {
    if (!conflictUserIds.trim() || !conflictStart || !conflictEnd) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const res = await checkConflictsMut.mutateAsync({
        userIds: conflictUserIds.split(',').map((s) => s.trim()),
        startTime: conflictStart,
        endTime: conflictEnd,
      });
      setConflicts((res as any)?.data?.conflicts ?? []);
    } catch {
      toast.error('Failed to check conflicts');
    }
  }

  // ── Loading ───────────────────────────────────────────────────────

  if (whLoading || blockedLoading) {
    return (
      <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="clock" size={22} />
        Availability
      </h2>

      {/* ── Working Hours ────────────────────────────────────────────── */}
      <Card style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Working Hours</h3>
          {!editingHours && (
            <Button variant="outline" onClick={handleEditWorkingHours}>
              <Icon name="edit" size={14} />
              Edit
            </Button>
          )}
        </div>

        {!editingHours ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Day</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Start</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>End</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {DAY_NAMES.map((name, idx) => {
                const wh = workingHours.find((h) => h.dayOfWeek === idx);
                return (
                  <tr key={idx}>
                    <td style={{ padding: '8px 12px', fontSize: 14, borderBottom: '1px solid #f3f4f6' }}>{name}</td>
                    <td style={{ padding: '8px 12px', fontSize: 14, borderBottom: '1px solid #f3f4f6' }}>{wh?.startTime ?? '--'}</td>
                    <td style={{ padding: '8px 12px', fontSize: 14, borderBottom: '1px solid #f3f4f6' }}>{wh?.endTime ?? '--'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                      <Badge variant={wh?.isWorkDay ? 'success' : 'secondary'}>
                        {wh?.isWorkDay ? 'Working' : 'Off'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Day</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Work Day</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Start</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>End</th>
                </tr>
              </thead>
              <tbody>
                {editedHours.map((wh) => (
                  <tr key={wh.dayOfWeek}>
                    <td style={{ padding: '8px 12px', fontSize: 14, borderBottom: '1px solid #f3f4f6' }}>
                      {DAY_NAMES[wh.dayOfWeek]}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
                      <input
                        type="checkbox"
                        checked={wh.isWorkDay}
                        onChange={(e) => handleUpdateHour(wh.dayOfWeek, 'isWorkDay', e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
                      <input
                        type="time"
                        value={wh.startTime}
                        onChange={(e) => handleUpdateHour(wh.dayOfWeek, 'startTime', e.target.value)}
                        disabled={!wh.isWorkDay}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: '1px solid #d1d5db',
                          fontSize: 14,
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
                      <input
                        type="time"
                        value={wh.endTime}
                        onChange={(e) => handleUpdateHour(wh.dayOfWeek, 'endTime', e.target.value)}
                        disabled={!wh.isWorkDay}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: '1px solid #d1d5db',
                          fontSize: 14,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button variant="primary" onClick={handleSaveWorkingHours} disabled={setWorkingHoursMut.isPending}>
                Save Working Hours
              </Button>
              <Button variant="outline" onClick={() => setEditingHours(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* ── Blocked Slots ────────────────────────────────────────────── */}
      <Card style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="slash" size={16} />
          Blocked Slots
        </h3>

        {blockedSlots.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>No blocked slots.</p>
        ) : (
          <div>
            {blockedSlots.map((slot: any) => (
              <div
                key={slot.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#fef2f2',
                  borderRadius: 6,
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{slot.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {formatDate(slot.startTime, 'dd MMM yyyy, hh:mm a')} - {formatDate(slot.endTime, 'hh:mm a')}
                    {slot.isRecurring && (
                      <Badge variant="secondary" style={{ marginLeft: 8 }}>Recurring</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteBlockedSlot(slot.id)}
                  disabled={deleteBlockedSlotMut.isPending}
                  style={{ padding: 4 }}
                >
                  <Icon name="trash-2" size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Find Free Slots ──────────────────────────────────────────── */}
      <Card style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="search" size={16} />
          Find Free Slots
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Input
            label="User IDs (comma-separated)"
            leftIcon={<Icon name="users" size={16} />}
            value={freeUserIds}
            onChange={(v: string) => setFreeUserIds(v)}
          />
          <Input
            label="Duration (minutes)"
            leftIcon={<Icon name="clock" size={16} />}
            value={String(freeDuration)}
            onChange={(v: string) => setFreeDuration(Number(v) || 0)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <DatePicker
            label="From Date"
            value={freeDateFrom}
            onChange={(v) => setFreeDateFrom(v as string)}
          />
          <DatePicker
            label="To Date"
            value={freeDateTo}
            onChange={(v) => setFreeDateTo(v as string)}
          />
        </div>

        <Button variant="primary" onClick={handleFindFreeSlots} disabled={findFreeSlotsMut.isPending}>
          <Icon name="search" size={14} />
          Find Slots
        </Button>

        {freeSlots.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Available Slots:</h4>
            {freeSlots.map((slot, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  backgroundColor: slot.isAvailable ? '#f0fdf4' : '#fef2f2',
                  borderRadius: 6,
                  marginBottom: 4,
                }}
              >
                <Icon name={slot.isAvailable ? 'check-circle' : 'x-circle'} size={14} />
                <span style={{ fontSize: 13 }}>
                  {formatDate(slot.start, 'dd MMM, hh:mm a')} - {formatDate(slot.end, 'hh:mm a')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Check Conflicts ──────────────────────────────────────────── */}
      <Card style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="alert-triangle" size={16} />
          Check Conflicts
        </h3>

        <div style={{ marginBottom: 12 }}>
          <Input
            label="User IDs (comma-separated)"
            leftIcon={<Icon name="users" size={16} />}
            value={conflictUserIds}
            onChange={(v: string) => setConflictUserIds(v)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <DatePicker
            label="Start Time"
            value={conflictStart}
            onChange={(v) => setConflictStart(v as string)}
          />
          <DatePicker
            label="End Time"
            value={conflictEnd}
            onChange={(v) => setConflictEnd(v as string)}
          />
        </div>

        <Button variant="primary" onClick={handleCheckConflicts} disabled={checkConflictsMut.isPending}>
          <Icon name="alert-triangle" size={14} />
          Check Conflicts
        </Button>

        {conflicts.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#ef4444' }}>
              Conflicts Found ({conflicts.length}):
            </h4>
            {conflicts.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#fef2f2',
                  borderRadius: 6,
                  marginBottom: 4,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500 }}>{evt.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {formatDate(evt.startTime, 'dd MMM, hh:mm a')} - {formatDate(evt.endTime, 'hh:mm a')}
                </div>
              </div>
            ))}
          </div>
        )}

        {checkConflictsMut.isSuccess && conflicts.length === 0 && (
          <div style={{ marginTop: 16, padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a' }}>
              <Icon name="check-circle" size={16} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>No conflicts found</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
