'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Webhook, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

const token = typeof window !== 'undefined' ? localStorage.getItem('wl_admin_token') || '' : '';
const BASE = process.env.NEXT_PUBLIC_WL_API_URL || '/api/v1/wl';
const apiFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

const STATUS_STYLES: Record<string, string> = {
  PROCESSED: 'bg-green-500/20 text-green-400 border border-green-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border border-red-500/30',
  PENDING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
};

export default function WebhookEventsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data: dashboard } = useQuery({
    queryKey: ['webhook-dashboard'],
    queryFn: () => apiFetch(`${BASE}/webhooks/dashboard`),
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ['webhook-events', status, page],
    queryFn: () =>
      apiFetch(`${BASE}/webhooks/events?page=${page}&limit=20${status ? `&status=${status}` : ''}`),
  });

  const stats = [
    { label: 'Total Events', value: dashboard?.total ?? 0, icon: <Webhook className="w-4 h-4 text-blue-400" /> },
    { label: 'Processed', value: dashboard?.processed ?? 0, icon: <CheckCircle className="w-4 h-4 text-green-400" /> },
    { label: 'Failed', value: dashboard?.failed ?? 0, icon: <XCircle className="w-4 h-4 text-red-400" /> },
    { label: 'Last 24h', value: dashboard?.last24h ?? 0, icon: <Activity className="w-4 h-4 text-purple-400" /> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Webhook className="w-6 h-6 text-blue-400" /> Webhook Events
        </h1>
        <p className="text-gray-400 text-sm mt-1">Razorpay payment webhook log and processing status</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{label}</span>
              {icon}
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
            {label === 'Processed' && dashboard?.successRate !== undefined && (
              <div className="text-xs text-green-400 mt-0.5">{dashboard.successRate}% success rate</div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'PROCESSED', 'FAILED', 'PENDING'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Event Type</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Source</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Verified</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Error</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : (events?.data ?? []).length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No webhook events yet</td></tr>
            ) : (
              (events?.data ?? []).map((evt: any) => (
                <tr key={evt.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white font-mono text-xs">{evt.eventType}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs capitalize">{evt.source}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[evt.processingStatus] ?? 'bg-gray-700 text-gray-300'}`}>
                      {evt.processingStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {evt.isVerified
                      ? <CheckCircle className="w-4 h-4 text-green-400" />
                      : <XCircle className="w-4 h-4 text-red-400" />}
                  </td>
                  <td className="px-4 py-3 text-red-400 text-xs max-w-xs truncate">{evt.errorMessage ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(evt.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {events?.meta && events.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">
              Page {events.meta.page} of {events.meta.totalPages} ({events.meta.total} total)
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded disabled:opacity-40 hover:text-white transition">Prev</button>
              <button disabled={page >= events.meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded disabled:opacity-40 hover:text-white transition">Next</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">Razorpay Webhook Setup</span>
        </div>
        <p className="text-xs text-gray-400 mb-2">Configure the Razorpay webhook URL in your dashboard:</p>
        <code className="block bg-gray-800 rounded px-3 py-2 text-xs text-green-400 font-mono">
          POST http://your-domain/api/v1/wl/webhooks/razorpay
        </code>
        <p className="text-xs text-gray-500 mt-2">
          Set <code className="text-yellow-400">RAZORPAY_WEBHOOK_SECRET</code> env var to match the secret configured in Razorpay dashboard.
          Include <code className="text-yellow-400">invoiceId</code> in payment notes for auto-reconciliation.
        </p>
      </div>
    </div>
  );
}
