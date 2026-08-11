'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Server, TrendingUp, TrendingDown, Settings, Play, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const token = typeof window !== 'undefined' ? localStorage.getItem('wl_admin_token') || '' : '';
const BASE = 'http://localhost:3010/api/v1/wl';
const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts?.headers ?? {}) } }).then((r) => r.json());

function fmtDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

export default function ScalingPage() {
  const qc = useQueryClient();
  const [editPolicy, setEditPolicy] = useState<any>(null);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['scaling-dashboard'],
    queryFn: () => apiFetch(`${BASE}/scaling/dashboard`),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ partnerId, enabled }: { partnerId: string; enabled: boolean }) =>
      apiFetch(`${BASE}/scaling/policies/${partnerId}`, {
        method: 'PUT',
        body: JSON.stringify({ isAutoScalingEnabled: enabled }),
      }),
    onSuccess: () => { toast.success('Policy updated'); qc.invalidateQueries({ queryKey: ['scaling-dashboard'] }); },
    onError: () => toast.error('Failed to update policy'),
  });

  const evalAllMutation = useMutation({
    mutationFn: () => apiFetch(`${BASE}/scaling/evaluate-all`, { method: 'POST' }),
    onSuccess: () => { toast.success('Evaluation triggered for all partners'); qc.invalidateQueries({ queryKey: ['scaling-dashboard'] }); },
    onError: () => toast.error('Failed to trigger evaluation'),
  });

  const savePolicyMutation = useMutation({
    mutationFn: (p: any) =>
      apiFetch(`${BASE}/scaling/policies/${p.partnerId}`, {
        method: 'PUT',
        body: JSON.stringify({ maxInstances: +p.maxInstances, scaleUpThreshold: +p.scaleUpThreshold, scaleDownThreshold: +p.scaleDownThreshold, cooldownMinutes: +p.cooldownMinutes }),
      }),
    onSuccess: () => { toast.success('Policy saved'); setEditPolicy(null); qc.invalidateQueries({ queryKey: ['scaling-dashboard'] }); },
    onError: () => toast.error('Failed to save policy'),
  });

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  const stats = [
    { label: 'Scale Ups', value: dashboard?.totalScaleUps ?? 0, icon: <TrendingUp className="w-4 h-4 text-green-400" /> },
    { label: 'Scale Downs', value: dashboard?.totalScaleDowns ?? 0, icon: <TrendingDown className="w-4 h-4 text-blue-400" /> },
    { label: 'Auto-Scaling Enabled', value: dashboard?.enabledPolicies ?? 0, icon: <Server className="w-4 h-4 text-purple-400" /> },
    { label: 'Partners Managed', value: (dashboard?.allPolicies ?? []).length, icon: <Settings className="w-4 h-4 text-gray-400" /> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-purple-400" /> Auto-Scaling
          </h1>
          <p className="text-gray-400 text-sm mt-1">Partner instance scaling policies and event history</p>
        </div>
        <button
          onClick={() => evalAllMutation.mutate()}
          disabled={evalAllMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition disabled:opacity-50"
        >
          <Play className="w-4 h-4" /> {evalAllMutation.isPending ? 'Evaluating...' : 'Evaluate All'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{label}</span>
              {icon}
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      {(dashboard?.recentEvents ?? []).length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-white mb-3">Recent Scaling Events</h2>
          <div className="space-y-2">
            {dashboard.recentEvents.map((evt: any) => (
              <div key={evt.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  {evt.eventType === 'SCALE_UP'
                    ? <TrendingUp className="w-4 h-4 text-green-400" />
                    : <TrendingDown className="w-4 h-4 text-blue-400" />}
                  <div>
                    <span className="text-xs text-white">{evt.partner?.companyName ?? evt.partnerId.slice(0, 8)}</span>
                    <span className="text-xs text-gray-500 ml-2">{evt.fromInstances} → {evt.toInstances} instances</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {evt.usageMetric !== null && (
                    <span className="text-xs text-gray-400">{evt.usageMetric}% usage</span>
                  )}
                  <span className="text-xs text-gray-500">{fmtDate(evt.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Scaling Policies</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Partner</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Plan</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Instances</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Thresholds</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Auto-Scale</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Last Scaled</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(dashboard?.allPolicies ?? []).length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No scaling policies yet. Policies are auto-created when a partner is evaluated.</td></tr>
            ) : (
              (dashboard?.allPolicies ?? []).map((policy: any) => (
                <tr key={policy.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white text-xs">{policy.partner?.companyName ?? policy.partnerId.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {policy.partner?.plan ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300 text-xs">
                    <span className="text-white font-medium">{policy.currentInstances}</span>
                    <span className="text-gray-500"> / {policy.maxInstances}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">
                    ↑{policy.scaleUpThreshold}% · ↓{policy.scaleDownThreshold}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleMutation.mutate({ partnerId: policy.partnerId, enabled: !policy.isAutoScalingEnabled })}
                      disabled={toggleMutation.isPending}
                      className="flex items-center gap-1 mx-auto text-xs transition"
                    >
                      {policy.isAutoScalingEnabled
                        ? <ToggleRight className="w-5 h-5 text-green-400" />
                        : <ToggleLeft className="w-5 h-5 text-gray-500" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(policy.lastScaledAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditPolicy({ ...policy })}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Policy Modal */}
      {editPolicy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Edit Scaling Policy</h2>
            <div className="space-y-3">
              {[
                { key: 'maxInstances', label: 'Max Instances', min: 1, max: 10 },
                { key: 'scaleUpThreshold', label: 'Scale Up Threshold (%)', min: 50, max: 95 },
                { key: 'scaleDownThreshold', label: 'Scale Down Threshold (%)', min: 5, max: 50 },
                { key: 'cooldownMinutes', label: 'Cooldown (minutes)', min: 5, max: 120 },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-400 mb-1">{label}</label>
                  <input
                    type="number"
                    value={editPolicy[key]}
                    onChange={(e) => setEditPolicy({ ...editPolicy, [key]: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setEditPolicy(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition">Cancel</button>
              <button
                onClick={() => savePolicyMutation.mutate(editPolicy)}
                disabled={savePolicyMutation.isPending}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition disabled:opacity-50"
              >
                {savePolicyMutation.isPending ? 'Saving...' : 'Save Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
