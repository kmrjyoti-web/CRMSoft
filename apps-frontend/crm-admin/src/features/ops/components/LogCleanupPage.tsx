"use client";

import { useCleanupDevLogs, useCleanupErrorLogs, useCleanupAuditLogs, useCleanupAll } from "../hooks/useOps";

export function LogCleanupPage() {
  const cleanupDev = useCleanupDevLogs();
  const cleanupError = useCleanupErrorLogs();
  const cleanupAudit = useCleanupAuditLogs();
  const cleanupAll = useCleanupAll();

  const policies = [
    {
      title: "Dev Logs",
      description: "DEBUG-level logs older than 7 days",
      retention: "7 days",
      icon: "🐛",
      action: () => cleanupDev.mutate(),
      pending: cleanupDev.isPending,
      result: cleanupDev.data?.data,
    },
    {
      title: "Error Logs",
      description: "INFO/WARN-level logs older than 30 days",
      retention: "30 days",
      icon: "⚠️",
      action: () => cleanupError.mutate(),
      pending: cleanupError.isPending,
      result: cleanupError.data?.data,
    },
    {
      title: "Audit Logs",
      description: "All audit trail entries older than 90 days",
      retention: "90 days",
      icon: "📋",
      action: () => cleanupAudit.mutate(),
      pending: cleanupAudit.isPending,
      result: cleanupAudit.data?.data,
    },
    {
      title: "Expired Sessions",
      description: "User sessions that expired more than 7 days ago",
      retention: "7 days",
      icon: "🔑",
      action: null,
      pending: false,
      result: null,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Cleanup</h1>
          <p className="text-sm text-gray-500 mt-1">Manual log cleanup — runs automatically on the 1st of each month</p>
        </div>
        <button
          onClick={() => cleanupAll.mutate()}
          disabled={cleanupAll.isPending}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {cleanupAll.isPending ? "Running all…" : "Run All Cleanup"}
        </button>
      </div>

      {cleanupAll.data?.data && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">Cleanup complete</p>
          <ul className="mt-2 space-y-1">
            {(cleanupAll.data.data as any[]).map((r, i) => (
              <li key={i} className="text-sm text-green-700">
                {r.type}: <strong>{r.deleted}</strong> records deleted in {r.duration}ms
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {policies.map((p) => (
          <div key={p.title} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{p.title}</h3>
                  <p className="text-xs text-gray-500">{p.description}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">Keep {p.retention}</span>
            </div>
            {p.result && (
              <p className="text-xs text-green-700 mb-2">
                Last run: {(p.result as any).deleted} records deleted in {(p.result as any).duration}ms
              </p>
            )}
            {p.action && (
              <button
                onClick={p.action}
                disabled={p.pending}
                className="w-full py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium text-gray-700"
              >
                {p.pending ? "Running…" : `Run ${p.title} Cleanup`}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-1">Automatic Schedule</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Nightly 2 AM IST</strong> — Dev logs + expired sessions cleanup</li>
          <li>• <strong>1st of month 4 AM IST</strong> — Full cleanup: all log types</li>
        </ul>
      </div>
    </div>
  );
}
