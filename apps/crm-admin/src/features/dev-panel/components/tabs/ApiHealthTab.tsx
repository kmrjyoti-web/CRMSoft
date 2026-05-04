"use client";

import { useEffect } from "react";

import { Button, Icon, Badge } from "@/components/ui";

import { useApiHealth } from "../../hooks/useApiHealth";

import type { HealthStatus } from "../../types/dev-panel.types";

const STATUS_BADGE: Record<HealthStatus, { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
  healthy: { variant: "success", label: "Healthy" },
  degraded: { variant: "warning", label: "Degraded" },
  down: { variant: "danger", label: "Down" },
  checking: { variant: "default", label: "Checking..." },
};

export function ApiHealthTab() {
  const { endpoints, summary, loading, lastRun, runHealthCheck } = useApiHealth();

  // Auto-run on mount
  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {summary.totalEndpoints > 0 && (
            <>
              <Badge variant="success">{summary.healthy} Healthy</Badge>
              {summary.degraded > 0 && <Badge variant="warning">{summary.degraded} Degraded</Badge>}
              {summary.down > 0 && <Badge variant="danger">{summary.down} Down</Badge>}
              <span className="text-sm text-gray-500">
                Avg: {summary.avgResponseTime}ms
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastRun && (
            <span className="text-xs text-gray-400">
              Last: {new Date(lastRun).toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" onClick={runHealthCheck} disabled={loading}>
            <Icon name={loading ? "loader" : "refresh"} size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Checking..." : "Run Health Check"}
          </Button>
        </div>
      </div>

      {/* Endpoint Table */}
      {endpoints.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Endpoint</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-700">Method</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-700">Status</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-700">Code</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">Time</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Group</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep) => {
                const badge = STATUS_BADGE[ep.status];
                return (
                  <tr key={ep.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{ep.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{ep.url}</div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <Badge variant="default">{ep.method}</Badge>
                    </td>
                    <td className="text-center px-3 py-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="text-center px-3 py-3 font-mono text-xs text-gray-600">
                      {ep.statusCode ?? "—"}
                    </td>
                    <td className="text-right px-3 py-3 font-mono text-xs">
                      <span className={ep.responseTimeMs && ep.responseTimeMs > 1000 ? "text-orange-500" : "text-gray-600"}>
                        {ep.responseTimeMs ? `${ep.responseTimeMs}ms` : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{ep.group}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {endpoints.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <Icon name="activity" size={32} className="mx-auto mb-2 opacity-50" />
          <p>Click &quot;Run Health Check&quot; to ping all API endpoints</p>
        </div>
      )}
    </div>
  );
}
