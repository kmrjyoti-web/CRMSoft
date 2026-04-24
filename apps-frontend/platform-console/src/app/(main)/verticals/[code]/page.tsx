'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

type V2Vertical = {
  id: string;
  vertical_code: string;
  vertical_name: string;
  display_name: string;
  description: string | null;
  icon_name: string | null;
  color_theme: string | null;
  folder_path: string;
  package_name: string;
  api_prefix: string;
  database_schemas: unknown;
  base_price: string | null;
  per_user_price: string | null;
  currency: string | null;
  is_active: boolean;
  is_beta: boolean;
  is_coming_soon: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  _count: { pc_vertical_module: number; pc_vertical_feature: number; pc_vertical_menu: number };
};

function deriveStatus(v: V2Vertical): string {
  if (v.is_coming_soon) return 'COMING_SOON';
  if (v.is_beta) return 'BETA';
  if (v.is_active) return 'ACTIVE';
  return 'INACTIVE';
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-900/50 text-green-400 border-green-800',
  BETA: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  INACTIVE: 'bg-red-900/50 text-red-400 border-red-800',
  COMING_SOON: 'bg-blue-900/50 text-blue-400 border-blue-800',
};

const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE', flags: { is_active: true, is_beta: false, is_coming_soon: false } },
  { label: 'Beta', value: 'BETA', flags: { is_active: true, is_beta: true, is_coming_soon: false } },
  { label: 'Coming Soon', value: 'COMING_SOON', flags: { is_active: false, is_beta: false, is_coming_soon: true } },
  { label: 'Inactive', value: 'INACTIVE', flags: { is_active: false, is_beta: false, is_coming_soon: false } },
];

const TABS = ['Overview', 'Technical'] as const;
type Tab = typeof TABS[number];

export default function VerticalDetailPage() {
  const params = useParams();
  const code = params.code as string;

  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [vertical, setVertical] = useState<V2Vertical | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [statusValue, setStatusValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const data = (await api.creator.getVertical(code)) as V2Vertical;
      setVertical(data);
      setStatusValue(deriveStatus(data));
    } catch {
      setVertical(null);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange() {
    if (!vertical || !statusValue) return;
    const option = STATUS_OPTIONS.find((o) => o.value === statusValue);
    if (!option) return;
    setSaving(true);
    setSaveMsg('');
    try {
      await api.creator.updateVertical(code, option.flags);
      setSaveMsg('Status updated.');
      await load();
    } catch {
      setSaveMsg('Failed to update status.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (vertical === null) {
    return (
      <div className="max-w-4xl space-y-4">
        <Link href="/verticals" className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#c9d1d9]">
          <ArrowLeft className="w-4 h-4" /> Back to verticals
        </Link>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
          <p className="text-sm text-[#8b949e]">Vertical not found</p>
        </div>
      </div>
    );
  }

  const status = vertical ? deriveStatus(vertical) : '';

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/verticals" className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#c9d1d9] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to verticals
      </Link>

      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {vertical!.color_theme && (
              <div className="w-4 h-4 mt-1 rounded flex-shrink-0" style={{ backgroundColor: vertical!.color_theme }} />
            )}
            <div>
              <h2 className="text-lg font-bold text-[#c9d1d9] font-mono">{vertical!.vertical_code}</h2>
              <p className="text-sm text-[#8b949e] mt-0.5">{vertical!.vertical_name} · {vertical!.display_name}</p>
              {vertical!.description && (
                <p className="text-xs text-[#8b949e]/70 mt-1 max-w-xl">{vertical!.description}</p>
              )}
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_COLORS[status] ?? 'bg-gray-900/50 text-gray-400 border-gray-800'}`}>
            {status.replace('_', ' ')}
          </span>
        </div>

        {/* Counts */}
        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#30363d]">
          <span className="text-xs text-[#8b949e]"><span className="text-[#c9d1d9] font-medium">{vertical!._count.pc_vertical_module}</span> modules</span>
          <span className="text-xs text-[#8b949e]"><span className="text-[#c9d1d9] font-medium">{vertical!._count.pc_vertical_feature}</span> features</span>
          <span className="text-xs text-[#8b949e]"><span className="text-[#c9d1d9] font-medium">{vertical!._count.pc_vertical_menu}</span> menu items</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/verticals/${code}/menus`}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:border-[#58a6ff]/50 rounded-md transition-colors"
        >
          Menu Builder
        </Link>
        <Link
          href={`/verticals/${code}/module/new`}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#238636] hover:bg-[#238636]/80 text-white rounded-md transition-colors"
        >
          + Add Module
        </Link>
        <Link
          href={`/verticals/${code}/feature/new`}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:border-[#3fb950]/50 rounded-md transition-colors"
        >
          + Add Feature
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#30363d]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-[#58a6ff] text-[#c9d1d9]'
                : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {saveMsg && <p className="text-xs text-green-400">{saveMsg}</p>}

      {/* Tab: Overview */}
      {activeTab === 'Overview' && vertical && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Cell label="Code" value={vertical.vertical_code} mono />
            <Cell label="Name" value={vertical.vertical_name} />
            <Cell label="Display Name" value={vertical.display_name} />
            <Cell label="Currency" value={vertical.currency ?? 'INR'} />
            <Cell label="Base Price" value={vertical.base_price ? `₹${Number(vertical.base_price).toLocaleString('en-IN')}` : '—'} />
            <Cell label="Per-User Price" value={vertical.per_user_price ? `₹${Number(vertical.per_user_price).toLocaleString('en-IN')}` : '—'} />
          </div>

          {/* Status change */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <p className="text-xs text-[#8b949e] mb-2 uppercase tracking-wider font-medium">Change Status</p>
            <div className="flex items-center gap-3">
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                className="bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-1.5 focus:outline-none focus:border-[#58a6ff]"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                onClick={handleStatusChange}
                disabled={saving || statusValue === status}
                className="px-3 py-1.5 text-xs bg-[#1f6feb] text-white rounded-md hover:bg-[#388bfd] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Technical */}
      {activeTab === 'Technical' && vertical && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Cell label="Folder Path" value={vertical.folder_path} mono />
            <Cell label="Package Name" value={vertical.package_name} mono />
            <Cell label="API Prefix" value={vertical.api_prefix} mono />
            <Cell label="Sort Order" value={String(vertical.sort_order)} />
            <Cell label="Created" value={new Date(vertical.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} />
            <Cell label="Updated" value={new Date(vertical.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} />
          </div>
          {vertical.database_schemas && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <p className="text-xs text-[#8b949e] mb-2 uppercase tracking-wider font-medium">Database Schemas</p>
              <pre className="text-xs text-[#c9d1d9]/80 font-mono">{JSON.stringify(vertical.database_schemas, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Cell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
      <p className="text-xs text-[#8b949e] mb-1">{label}</p>
      <p className={`text-sm text-[#c9d1d9] ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
