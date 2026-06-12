"use client";

import { useState } from "react";

import { Button, Icon, Badge, Input } from "@/components/ui";

import { useNetworkLog } from "../../hooks/useNetworkLog";

import type { RequestStatus } from "../../types/dev-panel.types";

const STATUS_CONFIG: Record<RequestStatus, { variant: "warning" | "success" | "danger"; label: string }> = {
  pending: { variant: "warning", label: "Pending" },
  success: { variant: "success", label: "Success" },
  error: { variant: "danger", label: "Error" },
};

export function NetworkLogTab() {
  const { logs, clear } = useNetworkLog();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = search
    ? logs.filter(
        (l) =>
          l.url.toLowerCase().includes(search.toLowerCase()) ||
          l.method.toLowerCase().includes(search.toLowerCase()),
      )
    : logs;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {logs.length} requests captured (max 100)
        </div>
        <Button variant="outline" onClick={clear}>
          <Icon name="trash" size={14} /> Clear
        </Button>
      </div>

      <Input
        placeholder="Filter by URL or method..."
        value={search}
        onChange={(v) => setSearch(v)}
        leftIcon={<Icon name="search" size={16} />}
      />

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 font-semibold text-gray-700 w-8"></th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Time</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Method</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">URL</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Status</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Code</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const cfg = STATUS_CONFIG[entry.status];
              const isExpanded = expandedId === entry.id;
              return (
                <tr key={entry.id} className="border-b border-gray-100">
                  <td className="px-2 py-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Icon name={isExpanded ? "chevron-down" : "chevron-right"} size={14} className="text-gray-400" />
                    </button>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap font-mono">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="text-center px-3 py-2">
                    <Badge variant="default">{entry.method}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-700 max-w-xs truncate">
                    {entry.url}
                  </td>
                  <td className="text-center px-3 py-2">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </td>
                  <td className="text-center px-3 py-2 font-mono text-xs text-gray-600">
                    {entry.statusCode ?? "—"}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  {logs.length === 0 ? "No network requests captured yet" : "No requests match your filter"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
