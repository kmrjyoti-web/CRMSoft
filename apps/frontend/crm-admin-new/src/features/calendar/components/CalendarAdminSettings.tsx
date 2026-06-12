'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button, Icon, Card, Input, Badge, DatePicker } from '@/components/ui';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/format-date';

import {
  useCalendarConfigs,
  useUpsertConfig,
  useHolidays,
  useCreateHoliday,
  useDeleteHoliday,
} from '../hooks/useCalendar';
import { calendarService } from '../services/calendar.service';
import type { CalendarConfig, Holiday } from '../types/calendar.types';

// ── Component ─────────────────────────────────────────────────────────

export function CalendarAdminSettings() {
  const { data: configsData, isLoading: configsLoading, refetch: refetchConfigs } = useCalendarConfigs();
  const upsertConfigMut = useUpsertConfig();
  const { data: holidaysData, isLoading: holidaysLoading } = useHolidays();
  const createHolidayMut = useCreateHoliday();
  const deleteHolidayMut = useDeleteHoliday();

  const configs: CalendarConfig[] = (configsData as any)?.data ?? [];
  const holidays: Holiday[] = (holidaysData as any)?.data ?? [];

  // ── Config edit state ─────────────────────────────────────────────
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // ── Holiday form state ────────────────────────────────────────────
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayRecurring, setHolidayRecurring] = useState(false);
  const [showAddHoliday, setShowAddHoliday] = useState(false);

  const [resetting, setResetting] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────

  function handleStartEdit(cfg: CalendarConfig) {
    setEditingKey(cfg.key);
    setEditValue(cfg.value);
  }

  async function handleSaveConfig() {
    if (!editingKey) return;
    try {
      await upsertConfigMut.mutateAsync({ key: editingKey, value: editValue });
      toast.success('Config updated');
      setEditingKey(null);
      setEditValue('');
    } catch {
      toast.error('Failed to update config');
    }
  }

  function handleCancelEdit() {
    setEditingKey(null);
    setEditValue('');
  }

  async function handleAddHoliday() {
    if (!holidayName.trim() || !holidayDate) {
      toast.error('Name and date are required');
      return;
    }
    try {
      await createHolidayMut.mutateAsync({
        name: holidayName.trim(),
        date: holidayDate,
        isRecurring: holidayRecurring,
      });
      toast.success('Holiday added');
      setHolidayName('');
      setHolidayDate('');
      setHolidayRecurring(false);
      setShowAddHoliday(false);
    } catch {
      toast.error('Failed to add holiday');
    }
  }

  async function handleDeleteHoliday(id: string) {
    if (!window.confirm('Remove this holiday?')) return;
    try {
      await deleteHolidayMut.mutateAsync(id);
      toast.success('Holiday removed');
    } catch {
      toast.error('Failed to remove holiday');
    }
  }

  async function handleResetDefaults() {
    if (!window.confirm('Reset all calendar configs to defaults? This cannot be undone.')) return;
    setResetting(true);
    try {
      await calendarService.resetConfigs();
      toast.success('Configs reset to defaults');
      refetchConfigs();
    } catch {
      toast.error('Failed to reset configs');
    } finally {
      setResetting(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────

  if (configsLoading || holidaysLoading) {
    return (
      <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="settings" size={22} />
          Calendar Admin Settings
        </h2>
        <Button variant="outline" onClick={handleResetDefaults} disabled={resetting}>
          <Icon name="rotate-ccw" size={14} />
          Reset to Defaults
        </Button>
      </div>

      {/* ── Configuration ────────────────────────────────────────────── */}
      <Card style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="sliders" size={16} />
          Configuration
        </h3>

        {configs.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>No configuration entries found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Key</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Value</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Description</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((cfg) => (
                <tr key={cfg.key}>
                  <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500, fontFamily: 'monospace', borderBottom: '1px solid #f3f4f6' }}>
                    {cfg.key}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
                    {editingKey === cfg.key ? (
                      <Input
                        value={editValue}
                        onChange={(v: string) => setEditValue(v)}
                      />
                    ) : (
                      <span>{cfg.value}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>
                    {cfg.description ?? '--'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                    {editingKey === cfg.key ? (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <Button
                          variant="primary"
                          onClick={handleSaveConfig}
                          disabled={upsertConfigMut.isPending}
                          style={{ padding: '4px 10px', fontSize: 12 }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleCancelEdit}
                          style={{ padding: '4px 10px', fontSize: 12 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => handleStartEdit(cfg)}
                        style={{ padding: 4 }}
                      >
                        <Icon name="edit" size={14} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── Holidays ─────────────────────────────────────────────────── */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="gift" size={16} />
            Holidays ({holidays.length})
          </h3>
          <Button variant="outline" onClick={() => setShowAddHoliday(!showAddHoliday)}>
            <Icon name="plus" size={14} />
            Add Holiday
          </Button>
        </div>

        {/* Add Holiday Form */}
        {showAddHoliday && (
          <div
            style={{
              padding: 16,
              backgroundColor: '#f9fafb',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Input
                label="Holiday Name"
                leftIcon={<Icon name="tag" size={16} />}
                value={holidayName}
                onChange={(v: string) => setHolidayName(v)}
              />
              <DatePicker
                label="Date"
                value={holidayDate}
                onChange={(v) => setHolidayDate(v as string)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={holidayRecurring}
                  onChange={(e) => setHolidayRecurring(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                Recurring annually
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={handleAddHoliday} disabled={createHolidayMut.isPending}>
                Add
              </Button>
              <Button variant="outline" onClick={() => setShowAddHoliday(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Holiday List */}
        {holidays.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>No holidays configured.</p>
        ) : (
          <div>
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{holiday.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {formatDate(holiday.date, 'dd MMM yyyy')}
                    </div>
                  </div>
                  {holiday.isRecurring && (
                    <Badge variant="secondary">Recurring</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteHoliday(holiday.id)}
                  disabled={deleteHolidayMut.isPending}
                  style={{ padding: 4 }}
                >
                  <Icon name="trash-2" size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
