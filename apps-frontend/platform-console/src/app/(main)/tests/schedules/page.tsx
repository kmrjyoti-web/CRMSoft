'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Clock, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type Schedule = {
  id: string;
  scheduleType: string;
  cronExpression: string | null;
  moduleScope: string | null;
  verticalScope: string | null;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
};

const SCHEDULE_TYPES = ['NIGHTLY', 'WEEKLY', 'PER_RELEASE', 'CUSTOM'];
const MODULE_OPTIONS = ['All', 'customer', 'marketplace', 'core', 'softwarevendor', 'ops', 'plugins', 'platform-console'];
const VERTICAL_OPTIONS = ['All', 'GENERAL', 'SOFTWARE_VENDOR', 'PHARMA', 'TEXTILE', 'FMCG', 'AUTOMOBILE', 'REAL_ESTATE', 'EDUCATION', 'HEALTHCARE'];

const TYPE_COLORS: Record<string, string> = {
  NIGHTLY: 'bg-purple-900/50 text-purple-400 border-purple-800',
  WEEKLY: 'bg-blue-900/50 text-blue-400 border-blue-800',
  PER_RELEASE: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  CUSTOM: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [scheduleType, setScheduleType] = useState('NIGHTLY');
  const [cronExpression, setCronExpression] = useState('');
  const [moduleScope, setModuleScope] = useState('All');
  const [verticalScope, setVerticalScope] = useState('All');

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await api.tests.schedules()) as { items?: Schedule[] } | Schedule[];
      setSchedules(Array.isArray(result) ? result : (result as any).items ?? []);
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  async function handleCreate() {
    setCreating(true);
    try {
      await api.tests.createSchedule({
        scheduleType,
        cronExpression: scheduleType === 'CUSTOM' ? cronExpression : undefined,
        moduleScope: moduleScope === 'All' ? undefined : moduleScope,
        verticalScope: verticalScope === 'All' ? undefined : verticalScope,
      });
      setShowCreate(false);
      setScheduleType('NIGHTLY');
      setCronExpression('');
      setModuleScope('All');
      setVerticalScope('All');
      await fetchSchedules();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(schedule: Schedule) {
    try {
      await api.tests.updateSchedule(schedule.id, { isActive: !schedule.isActive });
      await fetchSchedules();
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this schedule?')) return;
    try {
      await api.tests.deleteSchedule(id);
      await fetchSchedules();
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Test Schedules</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Automated test execution schedules</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Create Schedule
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-[#0d1117] border border-[#58a6ff]/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#c9d1d9]">New Schedule</h3>
            <button onClick={() => setShowCreate(false)} className="text-[#8b949e] hover:text-[#c9d1d9]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Schedule Type</label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
              >
                {SCHEDULE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {scheduleType === 'CUSTOM' && (
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Cron Expression</label>
                <input
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="e.g. 0 2 * * *"
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Module Scope</label>
              <select
                value={moduleScope}
                onChange={(e) => setModuleScope(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
              >
                {MODULE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Vertical Scope</label>
              <select
                value={verticalScope}
                onChange={(e) => setVerticalScope(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
              >
                {VERTICAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create
            </button>
          </div>
        </div>
      )}

      {/* Schedule list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : schedules.length > 0 ? (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${
                      TYPE_COLORS[schedule.scheduleType] ?? TYPE_COLORS.CUSTOM
                    }`}
                  >
                    {schedule.scheduleType}
                  </span>
                  <span className="text-xs text-[#8b949e]">
                    {schedule.moduleScope ?? 'All modules'} / {schedule.verticalScope ?? 'All verticals'}
                  </span>
                </div>
                {schedule.cronExpression && (
                  <p className="text-xs text-[#8b949e] font-mono mb-1">
                    Cron: {schedule.cronExpression}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                  <span>
                    Last Run:{' '}
                    {schedule.lastRunAt
                      ? new Date(schedule.lastRunAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                      : 'Never'}
                  </span>
                  <span>
                    Next Run:{' '}
                    {schedule.nextRunAt
                      ? new Date(schedule.nextRunAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Active toggle */}
              <button
                onClick={() => handleToggle(schedule)}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  schedule.isActive ? 'bg-[#238636]' : 'bg-[#30363d]'
                }`}
                title={schedule.isActive ? 'Disable' : 'Enable'}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    schedule.isActive ? 'left-4' : 'left-0.5'
                  }`}
                />
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(schedule.id)}
                className="p-1.5 rounded hover:bg-red-900/20 text-[#8b949e] hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
          <p className="text-sm text-[#8b949e]">No schedules configured</p>
        </div>
      )}
    </div>
  );
}
