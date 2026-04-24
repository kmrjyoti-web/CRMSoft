'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Rocket, RotateCcw, HeartPulse, Plus, X, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const token = typeof window !== 'undefined' ? localStorage.getItem('wl_admin_token') || '' : '';
const BASE = 'http://localhost:3010/api/v1/wl';
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

const STATUS_CONFIG: Record<string, { cls: string; icon: React.ReactNode }> = {
  DEPLOYED: { cls: 'bg-green-500/20 text-green-400 border border-green-500/30', icon: <CheckCircle className="w-3 h-3" /> },
  FAILED: { cls: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
  DEPLOYING: { cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  PENDING: { cls: 'bg-gray-600/40 text-gray-400 border border-gray-600/40', icon: <Clock className="w-3 h-3" /> },
  ROLLED_BACK: { cls: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', icon: <RotateCcw className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  );
}

export default function DeploymentsPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployForm, setDeployForm] = useState({ environment: 'production', version: 'v1.0.0' });
  const [healthData, setHealthData] = useState<any>(null);

  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['deployments', id],
    queryFn: () => apiFetch(`${BASE}/deployments/partner/${id}`).then((r) => r?.deployments ?? r ?? []),
  });

  const deployMutation = useMutation({
    mutationFn: () => apiFetch(`${BASE}/deployments`, { method: 'POST', body: JSON.stringify({ partnerId: id, ...deployForm }) }),
    onSuccess: () => {
      toast.success('Deployment initiated');
      setShowDeploy(false);
      qc.invalidateQueries({ queryKey: ['deployments', id] });
    },
    onError: () => toast.error('Deployment failed'),
  });

  const rollbackMutation = useMutation({
    mutationFn: (deployId: string) => apiFetch(`${BASE}/deployments/${deployId}/rollback`, { method: 'POST' }),
    onSuccess: () => { toast.success('Rollback initiated'); qc.invalidateQueries({ queryKey: ['deployments', id] }); },
    onError: () => toast.error('Rollback failed'),
  });

  const healthCheck = async () => {
    try {
      const res = await apiFetch(`${BASE}/deployments/partner/${id}/health`);
      setHealthData(res);
    } catch {
      toast.error('Health check failed');
    }
  };

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Rocket className="w-6 h-6 text-blue-400" /> Deployment Management
        </h1>
        <div className="flex gap-3">
          <button
            onClick={healthCheck}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
          >
            <HeartPulse className="w-4 h-4 text-green-400" /> Health Check
          </button>
          <button
            onClick={() => setShowDeploy(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Deploy New Version
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS(id).map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${label === 'Deployments' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Version</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Environment</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Deploy URL</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Deployed At</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(deployments as any[]).length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No deployments found</td></tr>
            ) : (
              (deployments as any[]).map((dep: any) => (
                <tr key={dep.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-white">{dep.version}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{dep.environment}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={dep.status} /></td>
                  <td className="px-4 py-3">
                    {dep.deployUrl ? (
                      <a href={dep.deployUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-xs underline truncate max-w-[160px] block">
                        {dep.deployUrl}
                      </a>
                    ) : <span className="text-gray-500 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{dep.deployedAt ? new Date(dep.deployedAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => rollbackMutation.mutate(dep.id)}
                      disabled={rollbackMutation.isPending}
                      className="flex items-center gap-1 px-2 py-1 bg-orange-900/40 hover:bg-orange-800/60 text-orange-400 text-xs rounded transition"
                    >
                      <RotateCcw className="w-3 h-3" /> Rollback
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Deploy Modal */}
      {showDeploy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Deploy New Version</h2>
              <button onClick={() => setShowDeploy(false)}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Version</label>
                <input
                  value={deployForm.version}
                  onChange={(e) => setDeployForm((f) => ({ ...f, version: e.target.value }))}
                  placeholder="v1.0.0"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Environment</label>
                <select
                  value={deployForm.environment}
                  onChange={(e) => setDeployForm((f) => ({ ...f, environment: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none"
                >
                  {['development', 'staging', 'production', 'preview'].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowDeploy(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition">Cancel</button>
              <button
                disabled={deployMutation.isPending}
                onClick={() => deployMutation.mutate()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition disabled:opacity-40"
              >
                {deployMutation.isPending ? 'Deploying...' : 'Deploy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Health Modal */}
      {healthData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><HeartPulse className="w-5 h-5 text-green-400" /> Health Status</h2>
              <button onClick={() => setHealthData(null)}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            </div>
            <div className="space-y-2">
              {Object.entries(healthData).map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400 text-sm capitalize">{k}</span>
                  <span className="text-white text-sm font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
