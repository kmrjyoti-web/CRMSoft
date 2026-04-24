'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Rocket, GitBranch, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

type Stats = {
  totalDeploys: number;
  frequencyPerWeek: number;
  avgDeployTimeMinutes: number;
  failureRate: number;
  lastDeployStatus: string;
};

type Deployment = {
  id: string;
  environment: string;
  version: string;
  status: string;
  startedAt: string;
};

type Pipeline = {
  id: string;
  pipelineName: string;
  branch: string;
  triggerType: string;
  status: string;
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
  RUNNING: <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />,
  ROLLED_BACK: <AlertTriangle className="w-4 h-4 text-orange-400" />,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CICDDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sData, dData, pData] = await Promise.all([
        api.cicd.stats() as Promise<any>,
        api.cicd.latestDeployments() as Promise<any>,
        api.cicd.pipelines() as Promise<any>,
      ]);
      setStats(sData);
      setDeployments(Array.isArray(dData) ? dData : dData?.items ?? []);
      setPipelines(Array.isArray(pData) ? pData : pData?.items ?? []);
    } catch {
      setStats(null);
      setDeployments([]);
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9]">CI/CD Overview</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">Deployment and pipeline activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Total Deploys</p>
          <p className="text-xl font-bold text-[#c9d1d9] mt-1">{stats?.totalDeploys ?? 0}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Frequency</p>
          <p className="text-xl font-bold text-[#c9d1d9] mt-1">{stats?.frequencyPerWeek?.toFixed(1) ?? '0'}/wk</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Avg Deploy Time</p>
          <p className="text-xl font-bold text-[#c9d1d9] mt-1">{stats?.avgDeployTimeMinutes?.toFixed(1) ?? '0'}m</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Failure Rate</p>
          <p className={`text-xl font-bold mt-1 ${(stats?.failureRate ?? 0) > 10 ? 'text-red-400' : 'text-green-400'}`}>
            {stats?.failureRate?.toFixed(1) ?? '0'}%
          </p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Last Deploy</p>
          <div className="flex items-center gap-2 mt-1">
            {STATUS_ICONS[stats?.lastDeployStatus ?? ''] ?? <Clock className="w-4 h-4 text-[#8b949e]" />}
            <span className="text-sm font-medium text-[#c9d1d9]">{stats?.lastDeployStatus ?? 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Deployments */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#c9d1d9]">Recent Deployments</h3>
            <Link href="/cicd/deployments" className="text-xs text-[#58a6ff] hover:underline">View all</Link>
          </div>
          {deployments.length > 0 ? (
            <div className="space-y-2">
              {deployments.slice(0, 5).map((d) => (
                <Link
                  key={d.id}
                  href={`/cicd/deployments/${d.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.02] transition-colors"
                >
                  {STATUS_ICONS[d.status] ?? <Clock className="w-4 h-4 text-[#8b949e]" />}
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${ENV_COLORS[d.environment] ?? ENV_COLORS.DEVELOPMENT}`}>
                    {d.environment}
                  </span>
                  <span className="flex-1 text-sm text-[#c9d1d9] font-mono">{d.version}</span>
                  <span className="text-xs text-[#8b949e]">{timeAgo(d.startedAt)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Rocket className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
              <p className="text-sm text-[#8b949e]">No deployments yet</p>
            </div>
          )}
        </div>

        {/* Pipeline Runs */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#c9d1d9]">Pipeline Runs (7 days)</h3>
            <Link href="/cicd/pipelines" className="text-xs text-[#58a6ff] hover:underline">View all</Link>
          </div>
          {pipelines.length > 0 ? (
            <div className="space-y-2">
              {pipelines.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/cicd/pipelines/${p.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.02] transition-colors"
                >
                  {STATUS_ICONS[p.status] ?? <Clock className="w-4 h-4 text-[#8b949e]" />}
                  <span className="flex-1 text-sm text-[#c9d1d9]">{p.pipelineName}</span>
                  <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e]">{p.branch}</code>
                  <span className="text-xs text-[#8b949e]">{p.triggerType}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GitBranch className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
              <p className="text-sm text-[#8b949e]">No pipeline runs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
