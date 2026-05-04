'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';

const token =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_token') || '' : '';
const partnerId =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_id') || '' : '';
const BASE = process.env.NEXT_PUBLIC_WL_API_URL || '/api/v1/wl';

const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts?.headers || {}),
    },
  }).then((r) => r.json());

type Severity = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const SEVERITY_TABS: Severity[] = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const severityBadge: Record<string, string> = {
  LOW: 'bg-blue-900 text-blue-300',
  MEDIUM: 'bg-yellow-900 text-yellow-300',
  HIGH: 'bg-orange-900 text-orange-300',
  CRITICAL: 'bg-red-900 text-red-300',
};

const severityIcon: Record<string, React.ReactNode> = {
  LOW: <Info size={12} />,
  MEDIUM: <AlertTriangle size={12} />,
  HIGH: <AlertCircle size={12} />,
  CRITICAL: <ShieldAlert size={12} />,
};

const statusBadge: Record<string, string> = {
  OPEN: 'bg-red-900 text-red-300',
  INVESTIGATING: 'bg-yellow-900 text-yellow-300',
  RESOLVED: 'bg-green-900 text-green-300',
};

function formatTs(ts: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ErrorLogsPage() {
  const [activeTab, setActiveTab] = useState<Severity>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['partner-errors', partnerId],
    queryFn: () => apiFetch(`${BASE}/errors/partner/${partnerId}`),
    enabled: !!partnerId,
  });

  const errors: any[] = data?.errors || data || [];

  const filtered =
    activeTab === 'ALL' ? errors : errors.filter((e: any) => e.severity === activeTab);

  const total = errors.length;
  const open = errors.filter((e: any) => e.status === 'OPEN').length;
  const critical = errors.filter((e: any) => e.severity === 'CRITICAL').length;
  const resolved = errors.filter((e: any) => e.status === 'RESOLVED').length;

  const summaryCards = [
    { label: 'Total Errors', value: total, icon: AlertCircle, color: 'gray' },
    { label: 'Open', value: open, icon: AlertTriangle, color: 'red' },
    { label: 'Critical', value: critical, icon: ShieldAlert, color: 'red' },
    { label: 'Resolved (this month)', value: resolved, icon: CheckCircle, color: 'green' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Logs</h1>
          <p className="text-sm text-gray-400 mt-1">Errors from your partner instances</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{label}</span>
              <Icon size={18} className={`text-${color}-400`} />
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {SEVERITY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Timestamp', 'Error Type', 'Message', 'Severity', 'Status'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No errors found
                </td>
              </tr>
            ) : (
              filtered.map((err: any) => (
                <tr
                  key={err.id}
                  className={`border-b border-gray-800 last:border-0 ${
                    err.severity === 'CRITICAL' ? 'border-l-2 border-l-red-500' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {formatTs(err.createdAt || err.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-white">
                    {err.errorType || err.type || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 max-w-xs">
                    <span title={err.message}>
                      {(err.message || '').length > 80
                        ? (err.message || '').slice(0, 80) + '…'
                        : err.message || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        severityBadge[err.severity] || 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {severityIcon[err.severity]}
                      {err.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        statusBadge[err.status] || 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {err.status || '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
