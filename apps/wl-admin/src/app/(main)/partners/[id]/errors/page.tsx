'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const token = typeof window !== 'undefined' ? localStorage.getItem('wl_admin_token') || '' : '';
const BASE = process.env.NEXT_PUBLIC_WL_API_URL || '/api/v1/wl';
const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts?.headers || {}) } }).then((r) => r.json());

const TABS = (id: string) => [
  { label: 'Overview', href: `/partners/${id}` },
  { label: 'Branding', href: `/partners/${id}/branding` },
  { label: 'Domains', href: `/partners/${id}/domains` },
  { label: 'Pricing', href: `/partners/${id}/pricing` },
  { label: 'Provisioning', href: `/partners/${id}/provisioning` },
  { label: 'Git', href: `/partners/${id}/git` },
  { label: 'Deployments', href: `/partners/${id}/deployments` },
  { label: 'Errors', href: `/partners/${id}/errors` },
  { label: 'Tests', href: `/partners/${id}/tests` },
  { label: 'Dev Requests', href: `/partners/${id}/dev-requests` },
  { label: 'Usage', href: `/partners/${id}/usage` },
  { label: 'Billing', href: `/partners/${id}/billing` },
];

const SEVERITY_CONFIG: Record<string, { badge: string; row?: string }> = {
  LOW: { badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  MEDIUM: { badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  HIGH: { badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  CRITICAL: { badge: 'bg-red-500/20 text-red-400 border border-red-500/30', row: 'bg-red-950/30' },
};

const SEVERITY_FILTERS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function ErrorsPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const { data: errors = [], isLoading } = useQuery({
    queryKey: ['errors', id],
    queryFn: () => apiFetch(`${BASE}/errors/partner/${id}`).then((r) => r?.errors ?? r ?? []),
  });

  const resolveMutation = useMutation({
    mutationFn: (errorId: string) => apiFetch(`${BASE}/errors/${errorId}/resolve`, { method: 'PATCH' }),
    onSuccess: () => { toast.success('Error resolved'); qc.invalidateQueries({ queryKey: ['errors', id] }); },
    onError: () => toast.error('Failed to resolve'),
  });

  const filtered = (errors as any[]).filter(
    (e: any) => severityFilter === 'ALL' || e.severity === severityFilter
  );

  const total = (errors as any[]).length;
  const open = (errors as any[]).filter((e: any) => e.status === 'OPEN').length;
  const critical = (errors as any[]).filter((e: any) => e.severity === 'CRITICAL').length;
  const resolved = (errors as any[]).filter((e: any) => e.status === 'RESOLVED').length;

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" /> Error Logs
        </h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS(id).map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${label === 'Errors' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: total, cls: 'text-white' },
          { label: 'Open', value: open, cls: 'text-yellow-400' },
          { label: 'Critical', value: critical, cls: 'text-red-400' },
          { label: 'Resolved', value: resolved, cls: 'text-green-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${cls}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        {SEVERITY_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-lg transition font-medium ${
              severityFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Timestamp</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Error Type</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Message</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Severity</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No errors found</td></tr>
            ) : (
              filtered.map((err: any) => {
                const cfg = SEVERITY_CONFIG[err.severity] ?? SEVERITY_CONFIG.LOW;
                return (
                  <tr key={err.id} className={`border-b border-gray-800 ${cfg.row ?? 'hover:bg-gray-800/50'}`}>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{err.timestamp ? new Date(err.timestamp).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-white text-xs font-mono">{err.errorType ?? err.type ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs max-w-[240px]" title={err.message}>
                      {err.message ? err.message.slice(0, 60) + (err.message.length > 60 ? '…' : '') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>{err.severity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        err.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {err.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {err.status !== 'RESOLVED' && (
                        <button
                          onClick={() => resolveMutation.mutate(err.id)}
                          disabled={resolveMutation.isPending}
                          className="flex items-center gap-1 px-2 py-1 bg-green-900/40 hover:bg-green-800/60 text-green-400 text-xs rounded transition"
                        >
                          <CheckCircle className="w-3 h-3" /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
