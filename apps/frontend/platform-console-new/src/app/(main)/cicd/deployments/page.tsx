'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Rocket, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

type Deployment = {
  id: string;
  environment: string;
  version: string;
  status: string;
  gitBranch: string;
  gitCommitHash: string;
  deployedBy: string;
  durationSeconds: number | null;
  startedAt: string;
};

const ENV_COLORS: Record<string, string> = {
  PRODUCTION: 'bg-red-900/50 text-red-400 border-red-800',
  STAGING: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  DEVELOPMENT: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  SUCCESS: <CheckCircle className="w-4 h-4 text-green-400" />,
  FAILED: <XCircle className="w-4 h-4 text-red-400" />,
  DEPLOYING: <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />,
  ROLLED_BACK: <AlertTriangle className="w-4 h-4 text-orange-400" />,
};

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEnv, setFilterEnv] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterEnv) params.environment = filterEnv;
      if (filterStatus) params.status = filterStatus;
      const data = await api.cicd.deployments(Object.keys(params).length ? params : undefined) as any;
      setDeployments(Array.isArray(data) ? data : data?.items ?? []);
    } catch {
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  }, [filterEnv, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9]">Deployment History</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">All deployment records across environments</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={filterEnv}
          onChange={(e) => setFilterEnv(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-1.5 focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All Environments</option>
          <option value="PRODUCTION">Production</option>
          <option value="STAGING">Staging</option>
          <option value="DEVELOPMENT">Development</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-1.5 focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All Statuses</option>
          <option value="DEPLOYING">Deploying</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="ROLLED_BACK">Rolled Back</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Environment</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Version</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Branch</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Commit</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Deployed By</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Duration</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Started At</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deployments.length > 0 ? (
              deployments.map((d) => (
                <tr key={d.id} className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    {STATUS_ICONS[d.status] ?? <Clock className="w-4 h-4 text-[#8b949e]" />}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${ENV_COLORS[d.environment] ?? ENV_COLORS.DEVELOPMENT}`}>
                      {d.environment}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#c9d1d9] font-mono text-xs">{d.version}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{d.gitBranch}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e]">
                      {d.gitCommitHash?.slice(0, 7) ?? '—'}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{d.deployedBy}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {d.durationSeconds != null ? `${Math.floor(d.durationSeconds / 60)}m ${d.durationSeconds % 60}s` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(d.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/cicd/deployments/${d.id}`} className="text-xs text-[#58a6ff] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#8b949e]">
                  <Rocket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No deployments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
