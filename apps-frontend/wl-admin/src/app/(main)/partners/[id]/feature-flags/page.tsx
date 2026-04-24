'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ToggleLeft, ToggleRight, Zap, CheckSquare, XSquare } from 'lucide-react';
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
  { label: 'Feature Flags', href: `/partners/${id}/feature-flags` },
  { label: 'Git', href: `/partners/${id}/git` },
  { label: 'Deployments', href: `/partners/${id}/deployments` },
  { label: 'Errors', href: `/partners/${id}/errors` },
  { label: 'Tests', href: `/partners/${id}/tests` },
  { label: 'Dev Requests', href: `/partners/${id}/dev-requests` },
  { label: 'Usage', href: `/partners/${id}/usage` },
  { label: 'Billing', href: `/partners/${id}/billing` },
];

const CATEGORY_COLORS: Record<string, string> = {
  CRM: 'bg-blue-100 text-blue-700',
  Finance: 'bg-green-100 text-green-700',
  Integrations: 'bg-purple-100 text-purple-700',
  Payments: 'bg-yellow-100 text-yellow-700',
  Platform: 'bg-indigo-100 text-indigo-700',
  Mobile: 'bg-pink-100 text-pink-700',
  Analytics: 'bg-orange-100 text-orange-700',
  Data: 'bg-teal-100 text-teal-700',
  Developer: 'bg-gray-100 text-gray-700',
  Customization: 'bg-red-100 text-red-700',
  Automation: 'bg-cyan-100 text-cyan-700',
  Storage: 'bg-lime-100 text-lime-700',
  Communications: 'bg-violet-100 text-violet-700',
  Support: 'bg-amber-100 text-amber-700',
  Branding: 'bg-rose-100 text-rose-700',
};

type Feature = {
  code: string;
  label: string;
  description: string;
  category: string;
  isEnabled: boolean;
  config: unknown;
  flagId: string | null;
};

export default function FeatureFlagsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const { data: flags = [], isLoading } = useQuery<Feature[]>({
    queryKey: ['feature-flags', id],
    queryFn: () => apiFetch(`${BASE}/feature-flags/partner/${id}`),
  });

  const toggleMut = useMutation({
    mutationFn: ({ code, isEnabled }: { code: string; isEnabled: boolean }) =>
      apiFetch(`${BASE}/feature-flags/partner/${id}/${code}`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled }),
      }),
    onSuccess: (_, { code, isEnabled }) => {
      toast.success(`${code} ${isEnabled ? 'enabled' : 'disabled'}`);
      qc.invalidateQueries({ queryKey: ['feature-flags', id] });
    },
    onError: () => toast.error('Failed to update feature flag'),
  });

  const bulkMut = useMutation({
    mutationFn: (action: 'enable-all' | 'disable-all') =>
      apiFetch(`${BASE}/feature-flags/partner/${id}/${action}`, { method: 'POST' }),
    onSuccess: (_, action) => {
      toast.success(action === 'enable-all' ? 'All features enabled' : 'All features disabled');
      qc.invalidateQueries({ queryKey: ['feature-flags', id] });
    },
    onError: () => toast.error('Bulk action failed'),
  });

  const categories = ['ALL', ...Array.from(new Set(flags.map((f) => f.category)))];
  const filtered = flags.filter((f) => {
    const statusMatch = filter === 'ALL' || (filter === 'ENABLED' ? f.isEnabled : !f.isEnabled);
    const catMatch = categoryFilter === 'ALL' || f.category === categoryFilter;
    return statusMatch && catMatch;
  });

  const enabledCount = flags.filter((f) => f.isEnabled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex gap-2 overflow-x-auto text-sm">
        {TABS(id).map((t) => (
          <Link key={t.href} href={t.href} className={`px-3 py-1.5 rounded whitespace-nowrap ${t.href.endsWith('feature-flags') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="text-yellow-500" size={24} /> Feature Flags
            </h1>
            <p className="text-gray-500 text-sm mt-1">{enabledCount}/{flags.length} features enabled</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => bulkMut.mutate('enable-all')}
              disabled={bulkMut.isPending}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              <CheckSquare size={16} /> Enable All
            </button>
            <button
              onClick={() => bulkMut.mutate('disable-all')}
              disabled={bulkMut.isPending}
              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              <XSquare size={16} /> Disable All
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-1 bg-white rounded-lg border p-1">
            {(['ALL', 'ENABLED', 'DISABLED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded text-sm ${filter === s ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((feature) => (
              <div
                key={feature.code}
                className={`bg-white rounded-lg border p-4 flex items-start justify-between transition-all ${feature.isEnabled ? 'border-green-200 shadow-sm' : 'border-gray-200'}`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{feature.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[feature.category] || 'bg-gray-100 text-gray-600'}`}>
                      {feature.category}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">{feature.description}</p>
                  <code className="text-xs text-gray-400 font-mono mt-1 block">{feature.code}</code>
                </div>
                <button
                  onClick={() => toggleMut.mutate({ code: feature.code, isEnabled: !feature.isEnabled })}
                  disabled={toggleMut.isPending}
                  className="shrink-0 mt-1"
                  title={feature.isEnabled ? 'Disable' : 'Enable'}
                >
                  {feature.isEnabled ? (
                    <ToggleRight size={32} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-300" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No features match the selected filters</div>
        )}
      </div>
    </div>
  );
}
