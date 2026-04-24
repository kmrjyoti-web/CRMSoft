'use client';

import { useState, useCallback, useEffect } from 'react';
import { Bell, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { api, type AlertRuleInput } from '@/lib/api';

type AlertRule = AlertRuleInput & { id: string; createdAt: string };

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'ANY'];

const EMPTY_FORM: AlertRuleInput = {
  name: '',
  errorCodePattern: '',
  severity: 'HIGH',
  thresholdCount: 10,
  windowMinutes: 60,
  cooldownMinutes: 30,
  channels: {},
  enabled: true,
};

function RuleForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial: AlertRuleInput;
  onSubmit: (data: AlertRuleInput) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<AlertRuleInput>(initial);
  const [channelsRaw, setChannelsRaw] = useState(
    initial.channels ? JSON.stringify(initial.channels, null, 2) : '{}',
  );
  const [channelError, setChannelError] = useState('');

  function handleChange(field: keyof AlertRuleInput, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    try {
      const parsed = JSON.parse(channelsRaw);
      setChannelError('');
      onSubmit({ ...form, channels: parsed });
    } catch {
      setChannelError('Invalid JSON for channels.');
    }
  }

  return (
    <div className="bg-[#0d1117] border border-[#58a6ff]/30 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Critical Payment Errors"
            className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Error Code Pattern (regex) *</label>
          <input
            type="text"
            value={form.errorCodePattern}
            onChange={(e) => handleChange('errorCodePattern', e.target.value)}
            placeholder="e.g. E_PAYMENT_.*"
            className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Severity</label>
          <select
            value={form.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Threshold Count</label>
          <input
            type="number"
            value={form.thresholdCount}
            onChange={(e) => handleChange('thresholdCount', Number(e.target.value))}
            min={1}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Window (minutes)</label>
          <input
            type="number"
            value={form.windowMinutes}
            onChange={(e) => handleChange('windowMinutes', Number(e.target.value))}
            min={1}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Cooldown (minutes)</label>
          <input
            type="number"
            value={form.cooldownMinutes}
            onChange={(e) => handleChange('cooldownMinutes', Number(e.target.value))}
            min={0}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Channels (JSON)</label>
        <textarea
          value={channelsRaw}
          onChange={(e) => setChannelsRaw(e.target.value)}
          rows={3}
          placeholder='{"slack": "#alerts", "email": "dev@example.com"}'
          className="w-full bg-[#161b22] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 font-mono resize-none focus:outline-none focus:border-[#58a6ff]"
        />
        {channelError && <p className="text-xs text-red-400 mt-1">{channelError}</p>}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="accent-[#58a6ff]"
          />
          <span className="text-xs text-[#8b949e]">Enabled</span>
        </label>
        <div className="ml-auto flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.name.trim() || !form.errorCodePattern.trim()}
            className="px-3 py-1.5 text-xs bg-[#1f6feb] text-white rounded-md hover:bg-[#388bfd] disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlertRulesPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await api.alerts.rules()) as { items?: AlertRule[] } | AlertRule[];
      setRules(Array.isArray(result) ? result : (result as any).items ?? []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  async function handleCreate(data: AlertRuleInput) {
    setActionLoading(true);
    try {
      await api.alerts.createRule(data);
      setShowNew(false);
      await fetchRules();
    } catch {
      // ignore — real app would show toast
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdate(id: string, data: AlertRuleInput) {
    setActionLoading(true);
    try {
      await api.alerts.updateRule(id, data);
      setEditingId(null);
      await fetchRules();
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this alert rule?')) return;
    try {
      await api.alerts.deleteRule(id);
      await fetchRules();
    } catch {
      // ignore
    }
  }

  async function handleToggle(rule: AlertRule) {
    setTogglingId(rule.id);
    try {
      await api.alerts.updateRule(rule.id, { enabled: !rule.enabled });
      await fetchRules();
    } catch {
      // ignore
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Alert Rules</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Configure automatic alerts when error thresholds are breached
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1f6feb] text-white rounded-md hover:bg-[#388bfd] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Rule
        </button>
      </div>

      {showNew && (
        <RuleForm
          initial={EMPTY_FORM}
          onSubmit={handleCreate}
          onCancel={() => setShowNew(false)}
          loading={actionLoading}
        />
      )}

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Name</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Condition</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Threshold</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Window</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Cooldown</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Enabled</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-[#30363d]/50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rules.length > 0 ? (
              rules.map((rule) => (
                <>
                  <tr
                    key={rule.id}
                    className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#c9d1d9] font-medium">{rule.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e]">
                        {rule.errorCodePattern}
                      </code>
                      {rule.severity !== 'ANY' && (
                        <span className="ml-2 text-xs text-[#58a6ff]">[{rule.severity}]</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#c9d1d9] text-xs">{rule.thresholdCount} errors</td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">{rule.windowMinutes}m</td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">{rule.cooldownMinutes}m</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(rule)}
                        disabled={togglingId === rule.id}
                        className={`relative w-9 h-5 rounded-full transition-colors ${
                          rule.enabled ? 'bg-[#238636]' : 'bg-[#30363d]'
                        } disabled:opacity-50`}
                        title={rule.enabled ? 'Disable' : 'Enable'}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            rule.enabled ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditingId(rule.id); setShowNew(false); }}
                          title="Edit"
                          className="p-1 rounded hover:bg-[#1f6feb]/20 text-[#8b949e] hover:text-[#58a6ff] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          title="Delete"
                          className="p-1 rounded hover:bg-red-900/20 text-[#8b949e] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === rule.id && (
                    <tr key={`edit-${rule.id}`} className="border-b border-[#30363d]/50">
                      <td colSpan={7} className="px-4 py-3">
                        <RuleForm
                          initial={rule}
                          onSubmit={(data) => handleUpdate(rule.id, data)}
                          onCancel={() => setEditingId(null)}
                          loading={actionLoading}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#8b949e]">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No alert rules configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
