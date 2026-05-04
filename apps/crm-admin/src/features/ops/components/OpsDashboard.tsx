"use client";

import { useDbSummary, useConnectionPool, useHealthCheck, useBackups } from "../hooks/useOps";

export function OpsDashboard() {
  const summary = useDbSummary();
  const pool = useConnectionPool();
  const health = useHealthCheck();
  const backups = useBackups();

  const lastBackupAt = (backups.data?.data as any[])?.[0]?.createdAt;
  const allHealthy = (health.data as any)?.checks?.every((c: any) => c.status === "ok");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operations Center</h1>
        <p className="text-sm text-gray-500 mt-1">Database health, backups, and maintenance controls</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="System Health"
          value={health.isLoading ? "—" : allHealthy ? "Healthy" : "Degraded"}
          badge={health.isLoading ? "loading" : allHealthy ? "ok" : "error"}
          sub="All services"
          href="/ops/health"
        />
        <StatCard
          title="DB Connections"
          value={pool.isLoading ? "—" : `${pool.data?.data?.total ?? 0} / ${pool.data?.data?.maxConnections ?? 0}`}
          badge={
            pool.isLoading
              ? "loading"
              : (pool.data?.data?.utilizationPercent ?? 0) > 80
              ? "warn"
              : "ok"
          }
          sub={`${pool.data?.data?.utilizationPercent ?? 0}% utilization`}
          href="/ops/db-maintenance"
        />
        <StatCard
          title="Total DB Size"
          value={summary.isLoading ? "—" : summary.data?.data?.totalSize ?? "—"}
          badge="info"
          sub={summary.data?.data?.pgVersion ?? "PostgreSQL"}
          href="/ops/db-maintenance"
        />
        <StatCard
          title="Last Backup"
          value={
            backups.isLoading
              ? "—"
              : lastBackupAt
              ? new Date(lastBackupAt).toLocaleDateString("en-IN")
              : "Never"
          }
          badge={lastBackupAt ? "ok" : "warn"}
          sub="Nightly 1 AM IST"
          href="/ops/backups"
        />
      </div>

      {/* Database list */}
      {summary.data?.data?.databases && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Databases</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {summary.data.data.databases.map((db) => (
              <div key={db.name} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-mono text-gray-800">{db.name}</span>
                <div className="flex gap-6 text-xs text-gray-500">
                  <span>{db.size}</span>
                  <span>{db.connections} connections</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink href="/ops/db-maintenance" label="DB Maintenance" icon="🗄️" />
          <QuickLink href="/ops/db-maintenance/indexes" label="Index Analysis" icon="🔍" />
          <QuickLink href="/ops/db-maintenance/cleanup" label="Log Cleanup" icon="🧹" />
          <QuickLink href="/ops/backups" label="Backups" icon="💾" />
          <QuickLink href="/ops/health" label="System Health" icon="❤️" />
          <QuickLink href="/ops/cron" label="Cron Jobs" icon="⏰" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  badge,
  href,
}: {
  title: string;
  value: string;
  sub: string;
  badge: "ok" | "warn" | "error" | "info" | "loading";
  href: string;
}) {
  const badgeColors: Record<string, string> = {
    ok: "bg-green-100 text-green-700",
    warn: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    loading: "bg-gray-100 text-gray-500",
  };
  const badgeLabels: Record<string, string> = {
    ok: "OK",
    warn: "Warning",
    error: "Error",
    info: "Info",
    loading: "Loading",
  };
  return (
    <a href={href} className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColors[badge]}`}>
          {badgeLabels[badge]}
        </span>
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </a>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-700"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
