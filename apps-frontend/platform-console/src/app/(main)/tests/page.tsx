'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TestTube2, Play, CheckCircle2, XCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type RecentExecution = {
  id: string;
  status: string;
  triggerType: string;
  startedAt: string;
  duration: number | null;
};

type Stats = {
  totalPlans: number;
  totalExecutions: number;
  lastRun: { status: string; startedAt: string } | null;
  avgCoverage: number;
  activeSchedules: number;
  recentExecutions: RecentExecution[];
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'PASSED') return <CheckCircle2 className="w-4 h-4 text-[#238636]" />;
  if (status === 'FAILED') return <XCircle className="w-4 h-4 text-[#da3633]" />;
  if (status === 'RUNNING') return <Loader2 className="w-4 h-4 text-[#d29922] animate-spin" />;
  return <XCircle className="w-4 h-4 text-[#f85149]" />;
}

export default function TestCenterDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.tests.stats()) as Stats;
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function handleRunAll() {
    setRunning(true);
    try {
      await api.tests.run();
      await fetchStats();
    } catch {
      // ignore
    } finally {
      setRunning(false);
    }
  }

  async function handleRunModule(module: string) {
    setRunning(true);
    try {
      await api.tests.runModule(module);
      await fetchStats();
    } catch {
      // ignore
    } finally {
      setRunning(false);
    }
  }

  async function handleRefreshCoverage() {
    setRunning(true);
    try {
      await api.tests.refreshCoverage();
      await fetchStats();
    } catch {
      // ignore
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

  const s = stats ?? {
    totalPlans: 0,
    totalExecutions: 0,
    lastRun: null,
    avgCoverage: 0,
    activeSchedules: 0,
    recentExecutions: [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Test Center</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Overview of test plans, executions, and coverage</p>
        </div>
        <button
          onClick={handleRunAll}
          disabled={running}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          Run All Tests
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Total Plans</p>
          <p className="text-2xl font-bold text-[#c9d1d9] mt-1">{s.totalPlans}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Total Executions</p>
          <p className="text-2xl font-bold text-[#c9d1d9] mt-1">{s.totalExecutions}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Last Run</p>
          {s.lastRun ? (
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon status={s.lastRun.status} />
              <span className="text-sm text-[#c9d1d9]">{s.lastRun.status}</span>
              <span className="text-xs text-[#8b949e]">{timeAgo(s.lastRun.startedAt)}</span>
            </div>
          ) : (
            <p className="text-sm text-[#8b949e] mt-1">No runs yet</p>
          )}
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Avg Coverage</p>
          <p className="text-2xl font-bold text-[#c9d1d9] mt-1">{s.avgCoverage.toFixed(1)}%</p>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Executions */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Recent Executions</h3>
          {s.recentExecutions.length > 0 ? (
            <div className="space-y-2">
              {s.recentExecutions.slice(0, 5).map((exec) => (
                <Link
                  key={exec.id}
                  href={`/tests/executions/${exec.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.03] transition-colors"
                >
                  <StatusIcon status={exec.status} />
                  <span className="text-xs text-[#c9d1d9] flex-1">{exec.triggerType}</span>
                  <span className="text-xs text-[#8b949e]">{timeAgo(exec.startedAt)}</span>
                  {exec.duration != null && (
                    <span className="text-xs text-[#8b949e]">{exec.duration}s</span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TestTube2 className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
              <p className="text-xs text-[#8b949e]">No executions yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRunAll}
              disabled={running}
              className="flex items-center justify-center gap-2 px-3 py-3 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" /> Run All
            </button>
            <button
              onClick={() => handleRunModule('customer')}
              disabled={running}
              className="flex items-center justify-center gap-2 px-3 py-3 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" /> Run Customer
            </button>
            <button
              onClick={() => handleRunModule('marketplace')}
              disabled={running}
              className="flex items-center justify-center gap-2 px-3 py-3 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" /> Run Marketplace
            </button>
            <button
              onClick={handleRefreshCoverage}
              disabled={running}
              className="flex items-center justify-center gap-2 px-3 py-3 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Coverage
            </button>
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="flex items-center gap-6">
        <Link href="/tests/schedules" className="text-sm text-[#58a6ff] hover:underline">
          Active Schedules: {s.activeSchedules}
        </Link>
        <Link href="/tests/plans" className="text-sm text-[#58a6ff] hover:underline">
          Test Plans: {s.totalPlans}
        </Link>
      </div>
    </div>
  );
}
