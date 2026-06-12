"use client";

import { useHealthCheck, useDeepHealthCheck } from "../hooks/useOps";

export function HealthPage() {
  const health = useHealthCheck();
  const deep = useDeepHealthCheck();

  const basicChecks = (health.data as any)?.checks || [];
  const deepChecks = (deep.data as any)?.checks || [];

  function statusColor(s: string) {
    return s === "ok" ? "text-green-600" : s === "degraded" ? "text-yellow-600" : "text-red-600";
  }
  function statusBg(s: string) {
    return s === "ok" ? "bg-green-100 text-green-700" : s === "degraded" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
  }

  const overallStatus = (health.data as any)?.status || "unknown";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time health checks — refreshes every 60 seconds</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusBg(overallStatus)}`}>
          {overallStatus.toUpperCase()}
        </span>
      </div>

      {/* Uptime + memory */}
      {health.data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Uptime"
            value={formatUptime((health.data as any).uptime || 0)}
          />
          <StatCard
            label="Heap Used"
            value={formatBytes((health.data as any).memoryUsage?.heapUsed || 0)}
          />
          <StatCard
            label="Heap Total"
            value={formatBytes((health.data as any).memoryUsage?.heapTotal || 0)}
          />
          <StatCard
            label="RSS"
            value={formatBytes((health.data as any).memoryUsage?.rss || 0)}
          />
        </div>
      )}

      {/* Basic health checks */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Health Checks</h2>
        </div>
        {health.isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : basicChecks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No health check data</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {basicChecks.map((check: any) => (
              <div key={check.name} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{check.name}</p>
                  {check.message && <p className="text-xs text-gray-500">{check.message}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {check.latency !== undefined && (
                    <span className="text-xs text-gray-400">{check.latency}ms</span>
                  )}
                  <span className={`w-2 h-2 rounded-full ${check.status === "ok" ? "bg-green-500" : "bg-red-500"}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deep checks */}
      {deepChecks.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Deep Health Checks</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {deepChecks.map((check: any) => (
              <div key={check.name} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{check.name}</p>
                  {check.message && <p className="text-xs text-gray-500">{check.message}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusBg(check.status)}`}>
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}
