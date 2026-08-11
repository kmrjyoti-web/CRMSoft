'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GitBranch, Plus, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

type VerticalVersion = {
  verticalType: string;
  currentVersion: string;
  healthStatus: string;
  modulesCount: number;
  endpointsCount: number;
  lastUpdated: string;
};

type Release = {
  id: string;
  version: string;
  verticalType: string;
  releaseType: string;
  status: string;
  releasedAt: string;
  createdAt: string;
};

const HEALTH_COLORS: Record<string, string> = {
  HEALTHY: 'bg-green-900/50 text-green-400 border-green-800',
  DEGRADED: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  DOWN: 'bg-red-900/50 text-red-400 border-red-800',
  PENDING: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-900/50 text-gray-400 border-gray-800',
  STAGING: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  RELEASED: 'bg-green-900/50 text-green-400 border-green-800',
  ROLLED_BACK: 'bg-red-900/50 text-red-400 border-red-800',
};

export default function VersionsPage() {
  const [verticals, setVerticals] = useState<VerticalVersion[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVertical, setFilterVertical] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vData, rData] = await Promise.all([
        api.versions.verticals() as Promise<VerticalVersion[] | { items: VerticalVersion[] }>,
        api.versions.list({
          ...(filterVertical ? { verticalType: filterVertical } : {}),
          ...(filterStatus ? { status: filterStatus } : {}),
        }) as Promise<{ items: Release[] } | Release[]>,
      ]);
      setVerticals(Array.isArray(vData) ? vData : (vData as any).items ?? []);
      setReleases(Array.isArray(rData) ? rData : (rData as any).items ?? []);
    } catch {
      setVerticals([]);
      setReleases([]);
    } finally {
      setLoading(false);
    }
  }, [filterVertical, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Current Versions</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Active version status per vertical</p>
        </div>
        <Link
          href="/versions/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Release
        </Link>
      </div>

      {/* Vertical version cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verticals.length > 0 ? (
          verticals.map((v) => (
            <div key={v.verticalType} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-[#c9d1d9]">{v.verticalType}</p>
                  <p className="text-lg font-bold text-[#58a6ff] mt-0.5">{v.currentVersion}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded border ${
                    HEALTH_COLORS[v.healthStatus] ?? HEALTH_COLORS.PENDING
                  }`}
                >
                  {v.healthStatus}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                <span>{v.modulesCount} modules</span>
                <span>{v.endpointsCount} endpoints</span>
              </div>
              <p className="text-xs text-[#8b949e] mt-2">
                Updated {new Date(v.lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
            <GitBranch className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
            <p className="text-sm text-[#8b949e]">No vertical versions found</p>
          </div>
        )}
      </div>

      {/* Release History */}
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9] mb-3">Release History</h2>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-3">
          <select
            value={filterVertical}
            onChange={(e) => setFilterVertical(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-1.5 focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="">All Verticals</option>
            {verticals.map((v) => (
              <option key={v.verticalType} value={v.verticalType}>
                {v.verticalType}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-1.5 focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="STAGING">Staging</option>
            <option value="RELEASED">Released</option>
            <option value="ROLLED_BACK">Rolled Back</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d]">
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Version</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Vertical</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Release Type</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Released At</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {releases.length > 0 ? (
                releases.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#c9d1d9] font-mono font-medium">{r.version}</td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">{r.verticalType ?? 'PLATFORM'}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e]">
                        {r.releaseType}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded border ${
                          STATUS_COLORS[r.status] ?? STATUS_COLORS.DRAFT
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">
                      {r.releasedAt
                        ? new Date(r.releasedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/versions/${r.id}`}
                        className="text-xs text-[#58a6ff] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#8b949e]">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No releases found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
