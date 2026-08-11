'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AlertTriangle, Clock, CreditCard, Play, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const token = typeof window !== 'undefined' ? localStorage.getItem('wl_admin_token') || '' : '';
const BASE = 'http://localhost:3010/api/v1/wl';
const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts?.headers ?? {}) } }).then((r) => r.json());

const ALERT_STYLES: Record<string, string> = {
  BREACH: 'bg-red-500/20 text-red-400 border border-red-500/30',
  WARNING_24H: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  PAYMENT_OVERDUE: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
};

export default function SlaAlertsPage() {
  const qc = useQueryClient();
  const [alertType, setAlertType] = useState('');
  const [page, setPage] = useState(1);

  const { data: dashboard } = useQuery({
    queryKey: ['sla-dashboard'],
    queryFn: () => apiFetch(`${BASE}/sla-alerts/dashboard`),
  });

  const { data: history, isLoading } = useQuery({
    queryKey: ['sla-history', alertType, page],
    queryFn: () =>
      apiFetch(`${BASE}/sla-alerts/history?page=${page}&limit=20${alertType ? `&alertType=${alertType}` : ''}`),
  });

  const runBreachMutation = useMutation({
    mutationFn: () => apiFetch(`${BASE}/sla-alerts/run/breaches`, { method: 'POST' }),
    onSuccess: () => { toast.success('Breach check triggered'); qc.invalidateQueries({ queryKey: ['sla-dashboard'] }); },
    onError: () => toast.error('Failed to run breach check'),
  });

  const runOverdueMutation = useMutation({
    mutationFn: () => apiFetch(`${BASE}/sla-alerts/run/overdue`, { method: 'POST' }),
    onSuccess: () => { toast.success('Overdue check triggered'); qc.invalidateQueries({ queryKey: ['sla-dashboard'] }); },
    onError: () => toast.error('Failed to run overdue check'),
  });

  const stats = [
    { label: 'SLA Breaches', value: dashboard?.overdueRequests ?? 0, sub: `${dashboard?.totalBreaches ?? 0} alerted`, icon: <ShieldAlert className="w-4 h-4 text-red-400" /> },
    { label: 'Due in 24h', value: dashboard?.upcomingIn24h ?? 0, sub: `${dashboard?.warnings24h ?? 0} warned`, icon: <Clock className="w-4 h-4 text-yellow-400" /> },
    { label: 'Overdue Invoices', value: dashboard?.overdueInvoices ?? 0, sub: 'payment pending', icon: <CreditCard className="w-4 h-4 text-orange-400" /> },
    { label: 'Total Alerts Sent', value: (dashboard?.totalBreaches ?? 0) + (dashboard?.warnings24h ?? 0) + (dashboard?.overdueInvoices ?? 0), sub: 'all time', icon: <AlertTriangle className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" /> SLA Alerts
          </h1>
          <p className="text-gray-400 text-sm mt-1">SLA breach monitoring and payment overdue tracking</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => runBreachMutation.mutate()}
            disabled={runBreachMutation.isPending}
            className="flex items-center gap-2 px-3 py-2 bg-red-900/40 hover:bg-red-800/60 text-red-400 text-xs rounded-lg transition disabled:opacity-50"
          >
            <Play className="w-3 h-3" /> Run Breach Check
          </button>
          <button
            onClick={() => runOverdueMutation.mutate()}
            disabled={runOverdueMutation.isPending}
            className="flex items-center gap-2 px-3 py-2 bg-orange-900/40 hover:bg-orange-800/60 text-orange-400 text-xs rounded-lg transition disabled:opacity-50"
          >
            <Play className="w-3 h-3" /> Run Overdue Check
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, sub, icon }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{label}</span>
              {icon}
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Recent alerts from dashboard */}
      {dashboard?.recentAlerts?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-white mb-3">Recent Alerts</h2>
          <div className="space-y-2">
            {dashboard.recentAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ALERT_STYLES[alert.alertType] ?? 'bg-gray-700 text-gray-300'}`}>
                    {alert.alertType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{alert.requestId.slice(0, 8)}…</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(alert.sentAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['', 'BREACH', 'WARNING_24H', 'PAYMENT_OVERDUE'].map((t) => (
          <button
            key={t}
            onClick={() => { setAlertType(t); setPage(1); }}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${alertType === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {t ? t.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Alert Type</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Request / Invoice ID</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Partner</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Subject</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Due Date</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Alerted At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : (history?.data ?? []).length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No alerts yet — system is healthy</td></tr>
            ) : (
              (history?.data ?? []).map((alert: any) => {
                const meta = alert.metadata ?? {};
                return (
                  <tr key={alert.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ALERT_STYLES[alert.alertType] ?? 'bg-gray-700 text-gray-300'}`}>
                        {alert.alertType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{alert.requestId.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{meta.partnerName ?? '—'}</td>
                    <td className="px-4 py-3 text-white text-xs">{meta.title ?? meta.invoiceNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {meta.dueDate ? new Date(meta.dueDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(alert.sentAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {history?.meta && history.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">Page {history.meta.page} of {history.meta.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded disabled:opacity-40 hover:text-white transition">Prev</button>
              <button disabled={page >= history.meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded disabled:opacity-40 hover:text-white transition">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
