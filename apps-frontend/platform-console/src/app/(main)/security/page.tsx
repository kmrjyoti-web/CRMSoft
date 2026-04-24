'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, RefreshCw, HeartPulse, Clock } from 'lucide-react';
import { api } from '@/lib/api';

type Snapshot = {
  service: string;
  status: string;
  responseTimeMs: number;
  checkedAt: string;
};

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  affectedService: string;
  startedAt: string;
};

type DRPlan = {
  service: string;
  rtoMinutes: number;
  rpoMinutes: number;
  lastTested: string | null;
};

type NotificationStats = {
  total: number;
  delivered: number;
  failed: number;
  last24h: number;
};

const STATUS_COLORS: Record<string, string> = {
  HEALTHY: 'bg-green-500',
  DEGRADED: 'bg-yellow-500',
  DOWN: 'bg-red-500',
};

const SEVERITY_COLORS: Record<string, string> = {
  P1: 'bg-red-900/50 text-red-500 border-red-800',
  P2: 'bg-orange-900/50 text-orange-500 border-orange-800',
  P3: 'bg-yellow-900/50 text-yellow-500 border-yellow-800',
  P4: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

const INCIDENT_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-900/50 text-red-400 border-red-800',
  INVESTIGATING: 'bg-orange-900/50 text-orange-400 border-orange-800',
  MITIGATED: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  RESOLVED: 'bg-green-900/50 text-green-400 border-green-800',
};

export default function SecurityDashboardPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [drPlans, setDRPlans] = useState<DRPlan[]>([]);
  const [notifStats, setNotifStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [snapData, incData, drData, statsData] = await Promise.all([
        api.security.latestSnapshots() as Promise<any>,
        api.security.incidents({ status: 'OPEN' }) as Promise<any>,
        api.security.drPlans() as Promise<any>,
        api.security.notificationStats() as Promise<any>,
      ]);
      setSnapshots(Array.isArray(snapData) ? snapData : snapData?.items ?? []);
      setIncidents(Array.isArray(incData) ? incData : incData?.items ?? []);
      setDRPlans(Array.isArray(drData) ? drData : drData?.items ?? []);
      setNotifStats(statsData);
    } catch {
      setSnapshots([]);
      setIncidents([]);
      setDRPlans([]);
      setNotifStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCapture = async () => {
    setCapturing(true);
    try {
      await api.security.captureSnapshot();
      await fetchData();
    } catch {
      // toast would go here
    } finally {
      setCapturing(false);
    }
  };

  const healthyCount = snapshots.filter((s) => s.status === 'HEALTHY').length;
  const totalServices = snapshots.length || 7;
  const uptime = totalServices > 0 ? Math.round((healthyCount / totalServices) * 100) : 0;
  const openIncidents = incidents.length;
  const drPlanCount = drPlans.length || 7;
  const alertsLast24h = notifStats?.last24h ?? 0;

  const needsTest = drPlans.filter((p) => {
    if (!p.lastTested) return true;
    const diff = Date.now() - new Date(p.lastTested).getTime();
    return diff > 30 * 24 * 60 * 60 * 1000;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
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
          <h2 className="text-base font-semibold text-[#c9d1d9]">Security & DR Overview</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Platform security posture and disaster readiness</p>
        </div>
        <button
          onClick={handleCapture}
          disabled={capturing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${capturing ? 'animate-spin' : ''}`} />
          {capturing ? 'Capturing...' : 'Capture Snapshot'}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Services</p>
          <p className="text-xl font-bold text-[#c9d1d9] mt-1">{healthyCount}/{totalServices}</p>
          <p className="text-xs text-green-400 mt-0.5">healthy</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Uptime</p>
          <p className="text-xl font-bold text-[#c9d1d9] mt-1">{uptime}%</p>
          <p className="text-xs text-[#8b949e] mt-0.5">current</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Open Incidents</p>
          <p className={`text-xl font-bold mt-1 ${openIncidents > 0 ? 'text-red-400' : 'text-green-400'}`}>{openIncidents}</p>
          <p className="text-xs text-[#8b949e] mt-0.5">active</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">DR Plans</p>
          <p className="text-xl font-bold text-[#c9d1d9] mt-1">{drPlanCount}/7</p>
          <p className="text-xs text-[#8b949e] mt-0.5">configured</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Alerts (24h)</p>
          <p className="text-xl font-bold text-[#c9d1d9] mt-1">{alertsLast24h}</p>
          <p className="text-xs text-[#8b949e] mt-0.5">notifications</p>
        </div>
      </div>

      {/* Health Timeline */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#c9d1d9] mb-4">Service Health</h3>
        <div className="space-y-3">
          {snapshots.length > 0 ? (
            snapshots.map((s) => (
              <div key={s.service} className="flex items-center gap-3">
                <div className="w-32 text-xs text-[#8b949e] truncate">{s.service}</div>
                <div className="flex-1 h-6 bg-[#0d1117] rounded overflow-hidden relative">
                  <div
                    className={`h-full ${STATUS_COLORS[s.status] ?? 'bg-gray-500'} rounded`}
                    style={{ width: s.status === 'HEALTHY' ? '100%' : s.status === 'DEGRADED' ? '60%' : '20%' }}
                  />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  s.status === 'HEALTHY' ? 'text-green-400' : s.status === 'DEGRADED' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {s.status}
                </span>
                <span className="text-xs text-[#8b949e] w-16 text-right">{s.responseTimeMs}ms</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <HeartPulse className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
              <p className="text-sm text-[#8b949e]">No snapshots captured yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Incidents */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#c9d1d9]">Active Incidents</h3>
            <Link href="/security/incidents" className="text-xs text-[#58a6ff] hover:underline">View all</Link>
          </div>
          {incidents.length > 0 ? (
            <div className="space-y-2">
              {incidents.slice(0, 5).map((inc) => (
                <Link
                  key={inc.id}
                  href={`/security/incidents/${inc.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.02] transition-colors"
                >
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${SEVERITY_COLORS[inc.severity] ?? SEVERITY_COLORS.P4}`}>
                    {inc.severity}
                  </span>
                  <span className="flex-1 text-sm text-[#c9d1d9] truncate">{inc.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${INCIDENT_STATUS_COLORS[inc.status] ?? INCIDENT_STATUS_COLORS.OPEN}`}>
                    {inc.status}
                  </span>
                  <span className="text-xs text-[#8b949e]">
                    {new Date(inc.startedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-400 opacity-30" />
              <p className="text-sm text-[#8b949e]">No active incidents</p>
            </div>
          )}
        </div>

        {/* DR Plans Needing Test */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#c9d1d9]">DR Plans Needing Test</h3>
            <Link href="/security/dr-plans" className="text-xs text-[#58a6ff] hover:underline">View all</Link>
          </div>
          {needsTest.length > 0 ? (
            <div className="space-y-2">
              {needsTest.map((p) => (
                <div key={p.service} className="flex items-center gap-3 px-3 py-2 rounded-md bg-yellow-900/10 border border-yellow-900/30">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="flex-1 text-sm text-[#c9d1d9]">{p.service}</span>
                  <span className="text-xs text-[#8b949e]">
                    {p.lastTested ? `Tested ${new Date(p.lastTested).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}` : 'Never tested'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 text-green-400 opacity-30" />
              <p className="text-sm text-[#8b949e]">All plans tested within 30 days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
