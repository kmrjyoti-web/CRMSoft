'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

type VerticalDetail = {
  code: string;
  name: string;
  nameHi: string;
  status: string;
  schemaVersion?: string;
  modulesCount: number;
  schemasConfig?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type HealthData = {
  apiStatus: string;
  dbStatus: string;
  testStatus: string;
  errorRate: number;
  avgResponseMs: number;
  lastChecked: string;
};

type AuditEntry = {
  id: string;
  score: number;
  metrics?: Record<string, { passed: boolean; label: string }>;
  issues?: string[];
  createdAt: string;
};

const STATUS_OPTIONS = ['ACTIVE', 'BETA', 'DEPRECATED'];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-900/50 text-green-400 border-green-800',
  BETA: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  DEPRECATED: 'bg-red-900/50 text-red-400 border-red-800',
};

const HEALTH_STATUS_DOT: Record<string, string> = {
  HEALTHY: 'bg-green-400',
  PASSING: 'bg-green-400',
  DEGRADED: 'bg-yellow-400',
  FAILING: 'bg-yellow-400',
  DOWN: 'bg-red-400',
};

const TABS = ['Overview', 'Health', 'Audits'] as const;
type Tab = typeof TABS[number];

export default function VerticalDetailPage() {
  const params = useParams();
  const code = params.code as string;

  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [detail, setDetail] = useState<VerticalDetail | null | undefined>(undefined);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<AuditEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [statusValue, setStatusValue] = useState('');

  const loadDetail = useCallback(async () => {
    try {
      const data = (await api.verticals.get(code)) as VerticalDetail;
      setDetail(data);
      setStatusValue(data.status);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [code]);

  const loadHealth = useCallback(async () => {
    try {
      const data = (await api.verticals.health(code)) as HealthData;
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }, [code]);

  const loadAudits = useCallback(async () => {
    try {
      const data = (await api.verticals.audits(code)) as any;
      const items: AuditEntry[] = Array.isArray(data) ? data : data.items ?? [];
      setAudits(items);
      if (items.length > 0 && !selectedAudit) {
        setSelectedAudit(items[0]);
      }
    } catch {
      setAudits([]);
    }
  }, [code, selectedAudit]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (activeTab === 'Health') loadHealth();
    if (activeTab === 'Audits') loadAudits();
  }, [activeTab, loadHealth, loadAudits]);

  async function handleStatusChange() {
    if (!statusValue || statusValue === detail?.status) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      await api.verticals.updateStatus(code, statusValue);
      setActionMsg('Status updated.');
      await loadDetail();
    } catch {
      setActionMsg('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRunAudit() {
    setActionLoading(true);
    setActionMsg('');
    try {
      await api.verticals.audit(code);
      setActionMsg('Audit started.');
      setSelectedAudit(null);
      await loadAudits();
    } catch {
      setActionMsg('Failed to run audit.');
    } finally {
      setActionLoading(false);
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

  if (detail === null) {
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

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/verticals"
        className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to verticals
      </Link>

      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#c9d1d9]">{detail!.code}</h2>
            <p className="text-sm text-[#8b949e] mt-0.5">{detail!.name} / {detail!.nameHi}</p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded border ${
              STATUS_COLORS[detail!.status] ?? 'bg-gray-900/50 text-gray-400 border-gray-800'
            }`}
          >
            {detail!.status}
          </span>
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

      {actionMsg && <p className="text-xs text-green-400">{actionMsg}</p>}

      {/* Tab: Overview */}
      {activeTab === 'Overview' && detail && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
              <p className="text-xs text-[#8b949e] mb-1">Code</p>
              <p className="text-sm text-[#c9d1d9] font-mono">{detail.code}</p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
              <p className="text-xs text-[#8b949e] mb-1">Name</p>
              <p className="text-sm text-[#c9d1d9]">{detail.name}</p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
              <p className="text-xs text-[#8b949e] mb-1">Hindi Name</p>
              <p className="text-sm text-[#c9d1d9]">{detail.nameHi}</p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
              <p className="text-xs text-[#8b949e] mb-1">Schema Version</p>
              <p className="text-sm text-[#c9d1d9] font-mono">{detail.schemaVersion ?? '\u2014'}</p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
              <p className="text-xs text-[#8b949e] mb-1">Modules</p>
              <p className="text-sm text-[#c9d1d9]">{detail.modulesCount ?? 0}</p>
            </div>
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
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={handleStatusChange}
                disabled={actionLoading || statusValue === detail.status}
                className="px-3 py-1.5 text-xs bg-[#1f6feb] text-white rounded-md hover:bg-[#388bfd] disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Schemas Config */}
          {detail.schemasConfig && Object.keys(detail.schemasConfig).length > 0 && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <p className="text-xs text-[#8b949e] mb-2 uppercase tracking-wider font-medium">Schemas Config</p>
              <pre className="text-xs text-[#c9d1d9]/80 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {JSON.stringify(detail.schemasConfig, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab: Health */}
      {activeTab === 'Health' && (
        <div className="space-y-4">
          {health ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'API Status', value: health.apiStatus },
                { label: 'DB Status', value: health.dbStatus },
                { label: 'Test Status', value: health.testStatus },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <p className="text-xs text-[#8b949e] mb-2">{label}</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${HEALTH_STATUS_DOT[value] ?? 'bg-gray-400'}`} />
                    <p className="text-sm font-medium text-[#c9d1d9]">{value}</p>
                  </div>
                </div>
              ))}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                <p className="text-xs text-[#8b949e] mb-2">Error Rate</p>
                <p className="text-lg font-bold text-[#c9d1d9]">{health.errorRate}<span className="text-xs text-[#8b949e] ml-1">errors/hr</span></p>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                <p className="text-xs text-[#8b949e] mb-2">Avg Response</p>
                <p className="text-lg font-bold text-[#c9d1d9]">{health.avgResponseMs}<span className="text-xs text-[#8b949e] ml-1">ms</span></p>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                <p className="text-xs text-[#8b949e] mb-2">Last Checked</p>
                <p className="text-sm text-[#c9d1d9]">
                  {new Date(health.lastChecked).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
              <p className="text-sm text-[#8b949e]">No health data available</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Audits */}
      {activeTab === 'Audits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8b949e]">{audits.length} audit(s) recorded</p>
            <button
              onClick={handleRunAudit}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Run Audit
            </button>
          </div>

          {/* Selected audit detail */}
          {selectedAudit && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8b949e] uppercase tracking-wider font-medium">Latest Audit</p>
                <p className="text-xs text-[#8b949e]">
                  {new Date(selectedAudit.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-bold ${
                  selectedAudit.score >= 80 ? 'text-green-400' : selectedAudit.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {selectedAudit.score}
                </div>
                <span className="text-sm text-[#8b949e]">/ 100</span>
              </div>

              {/* Metrics breakdown */}
              {selectedAudit.metrics && Object.keys(selectedAudit.metrics).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#30363d]">
                  {Object.entries(selectedAudit.metrics).map(([key, metric]) => (
                    <div key={key} className="flex items-center gap-2">
                      {metric.passed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      )}
                      <span className="text-xs text-[#c9d1d9]">{metric.label ?? key}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Issues */}
              {selectedAudit.issues && selectedAudit.issues.length > 0 && (
                <div className="pt-2 border-t border-[#30363d]">
                  <p className="text-xs text-[#8b949e] mb-1.5 uppercase tracking-wider font-medium">Issues</p>
                  <ul className="space-y-1">
                    {selectedAudit.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-red-400 flex items-start gap-1.5">
                        <span className="mt-0.5">{'\u2022'}</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Previous audits table */}
          {audits.length > 0 && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#30363d]">
                    <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Score</th>
                    <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((audit) => (
                    <tr
                      key={audit.id}
                      className={`border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        selectedAudit?.id === audit.id ? 'bg-[#58a6ff]/5' : ''
                      }`}
                      onClick={() => setSelectedAudit(audit)}
                    >
                      <td className="px-4 py-3 text-[#8b949e] text-xs">
                        {new Date(audit.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${
                          audit.score >= 80 ? 'text-green-400' : audit.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {audit.score}/100
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedAudit(audit); }}
                          className="text-xs text-[#58a6ff] hover:underline"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {audits.length === 0 && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
              <p className="text-sm text-[#8b949e]">No audits recorded. Run your first audit above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
