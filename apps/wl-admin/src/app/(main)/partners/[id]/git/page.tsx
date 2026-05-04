'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { GitBranch, Plus, GitMerge, Trash2, Info } from 'lucide-react';
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

const SCOPE_COLORS: Record<string, string> = {
  PARTNER_ONLY: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  SHARED: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  UPSTREAM: 'bg-green-500/20 text-green-400 border border-green-500/30',
};

export default function GitPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newBranch, setNewBranch] = useState({ branchName: '', scope: 'PARTNER_ONLY' });

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['git-branches', id],
    queryFn: () => apiFetch(`${BASE}/git-branches/partner/${id}`).then((r) => r?.branches ?? r ?? []),
  });

  const createMutation = useMutation({
    mutationFn: () => apiFetch(`${BASE}/git-branches`, { method: 'POST', body: JSON.stringify({ partnerId: id, ...newBranch }) }),
    onSuccess: () => {
      toast.success('Branch created');
      setShowCreate(false);
      setNewBranch({ branchName: '', scope: 'PARTNER_ONLY' });
      qc.invalidateQueries({ queryKey: ['git-branches', id] });
    },
    onError: () => toast.error('Failed to create branch'),
  });

  const mergeMutation = useMutation({
    mutationFn: (branchId: string) => apiFetch(`${BASE}/git-branches/${branchId}/merge-upstream`, { method: 'POST' }),
    onSuccess: () => { toast.success('Upstream merged'); qc.invalidateQueries({ queryKey: ['git-branches', id] }); },
    onError: () => toast.error('Merge failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (branchId: string) => apiFetch(`${BASE}/git-branches/${branchId}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('Branch deleted'); qc.invalidateQueries({ queryKey: ['git-branches', id] }); },
    onError: () => toast.error('Delete failed'),
  });

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-blue-400" /> Git Branch Management
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Branch
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS(id).map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${label === 'Git' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Scope Rules Info Box */}
      <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-4 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium text-blue-300 mb-2">Scope Rules</div>
          <ul className="text-xs text-blue-300/80 space-y-1">
            <li><span className="font-mono text-blue-400">PARTNER_ONLY</span> — Isolated branches containing only this partner's custom code and configurations</li>
            <li><span className="font-mono text-purple-400">SHARED</span> — Branches for shared features used across multiple partners</li>
            <li><span className="font-mono text-green-400">UPSTREAM</span> — Core CRM update branches tracked from the upstream repository</li>
          </ul>
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Branch Name</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Scope</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Last Commit</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Created At</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(branches as any[]).length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No branches found</td></tr>
            ) : (
              (branches as any[]).map((branch: any) => (
                <tr key={branch.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-white">{branch.branchName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SCOPE_COLORS[branch.scope] ?? 'bg-gray-700 text-gray-300'}`}>
                      {branch.scope}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{branch.status ?? 'active'}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{branch.lastCommit ? branch.lastCommit.slice(0, 8) : '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{branch.createdAt ? new Date(branch.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => mergeMutation.mutate(branch.id)}
                        disabled={mergeMutation.isPending}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-400 text-xs rounded transition"
                      >
                        <GitMerge className="w-3 h-3" /> Merge Upstream
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(branch.id)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1 px-2 py-1 bg-red-900/40 hover:bg-red-800/60 text-red-400 text-xs rounded transition"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Branch Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Create New Branch</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Branch Name</label>
                <input
                  value={newBranch.branchName}
                  onChange={(e) => setNewBranch((b) => ({ ...b, branchName: e.target.value }))}
                  placeholder="partner/code/feature/..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Scope</label>
                <select
                  value={newBranch.scope}
                  onChange={(e) => setNewBranch((b) => ({ ...b, scope: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none"
                >
                  <option value="PARTNER_ONLY">PARTNER_ONLY</option>
                  <option value="SHARED">SHARED</option>
                  <option value="UPSTREAM">UPSTREAM</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition">
                Cancel
              </button>
              <button
                disabled={!newBranch.branchName || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition disabled:opacity-40"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
