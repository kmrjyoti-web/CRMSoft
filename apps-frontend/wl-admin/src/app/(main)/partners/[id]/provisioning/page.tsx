'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Database, CheckCircle, XCircle, Clock, RefreshCw, Trash2 } from 'lucide-react';
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    online: 'bg-green-500/20 text-green-400 border border-green-500/30',
    offline: 'bg-red-500/20 text-red-400 border border-red-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  };
  const cls = map[status?.toLowerCase()] ?? 'bg-gray-700 text-gray-300';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

function StatusIcon({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === 'online') return <CheckCircle className="w-5 h-5 text-green-400" />;
  if (s === 'offline') return <XCircle className="w-5 h-5 text-red-400" />;
  return <Clock className="w-5 h-5 text-yellow-400" />;
}

export default function ProvisioningPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const [confirmCode, setConfirmCode] = useState('');
  const [deprovisionTarget, setDeprovisionTarget] = useState<string | null>(null);
  const [partnerCode, setPartnerCode] = useState('');

  const { data: dbList = [], isLoading } = useQuery({
    queryKey: ['provisioning', id],
    queryFn: async () => {
      const res = await apiFetch(`${BASE}/provisioning/partner/${id}`);
      if (res?.partnerCode) setPartnerCode(res.partnerCode);
      return res?.databases ?? res ?? [];
    },
  });

  const provisionMutation = useMutation({
    mutationFn: () => apiFetch(`${BASE}/provisioning/partner/${id}/provision`, { method: 'POST' }),
    onSuccess: () => { toast.success('All DBs provisioned'); qc.invalidateQueries({ queryKey: ['provisioning', id] }); },
    onError: () => toast.error('Provision failed'),
  });

  const deprovisionMutation = useMutation({
    mutationFn: (confirm: string) =>
      apiFetch(`${BASE}/provisioning/partner/${id}/deprovision`, { method: 'POST', body: JSON.stringify({ confirm }) }),
    onSuccess: () => {
      toast.success('Deprovisioned');
      setDeprovisionTarget(null);
      setConfirmCode('');
      qc.invalidateQueries({ queryKey: ['provisioning', id] });
    },
    onError: () => toast.error('Deprovision failed'),
  });

  const envOrder = ['dev', 'staging', 'prod', 'preview'];
  const summaryCards = envOrder.map((env) => {
    const db = (dbList as any[]).find((d: any) => d.environment?.toLowerCase() === env);
    return { env, db };
  });

  const confirmKey = `DELETE-${partnerCode || 'PARTNER'}`;

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-400" /> DB Provisioning
        </h1>
        <button
          onClick={() => provisionMutation.mutate()}
          disabled={provisionMutation.isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${provisionMutation.isPending ? 'animate-spin' : ''}`} />
          {provisionMutation.isPending ? 'Provisioning...' : 'Provision All DBs'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS(id).map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${label === 'Provisioning' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map(({ env, db }) => (
          <div key={env} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">{env} DB</span>
              <StatusIcon status={db?.status ?? 'offline'} />
            </div>
            <div className="text-sm font-medium text-white">{db?.dbName ?? 'Not provisioned'}</div>
            <div className="mt-1"><StatusBadge status={db?.status ?? 'offline'} /></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">DB Name</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Environment</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Size</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Created At</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(dbList as any[]).length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No databases provisioned</td></tr>
            ) : (
              (dbList as any[]).map((db: any) => (
                <tr key={db.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white font-mono text-xs">{db.dbName}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{db.environment}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={db.status} /></td>
                  <td className="px-4 py-3 text-gray-300">{db.size ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{db.createdAt ? new Date(db.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeprovisionTarget(db.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-900/40 hover:bg-red-800/60 text-red-400 text-xs rounded transition"
                    >
                      <Trash2 className="w-3 h-3" /> Deprovision
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Deprovision Modal */}
      {deprovisionTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-2">Confirm Deprovision</h2>
            <p className="text-gray-400 text-sm mb-4">
              This will permanently destroy the database. Type <span className="font-mono text-red-400">{confirmKey}</span> to confirm.
            </p>
            <input
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              placeholder={confirmKey}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 font-mono text-sm"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setDeprovisionTarget(null); setConfirmCode(''); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition">
                Cancel
              </button>
              <button
                disabled={confirmCode !== confirmKey || deprovisionMutation.isPending}
                onClick={() => deprovisionMutation.mutate(confirmCode)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition disabled:opacity-40"
              >
                {deprovisionMutation.isPending ? 'Deprovisioning...' : 'Confirm Deprovision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
