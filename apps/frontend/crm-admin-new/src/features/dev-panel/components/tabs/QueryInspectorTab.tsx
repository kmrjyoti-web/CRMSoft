"use client";

import { useState, useMemo, useCallback } from "react";

import { Button, Icon, Badge, Input } from "@/components/ui";

import { useQueryClient } from "@tanstack/react-query";

export function QueryInspectorTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [, forceUpdate] = useState(0);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  const queries = useMemo(() => {
    const cache = queryClient.getQueryCache();
    return cache.getAll().map((query) => {
      const state = query.state;
      const dataStr = JSON.stringify(state.data);
      const bytes = dataStr ? new Blob([dataStr]).size : 0;
      const dataSize = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

      let status: "fresh" | "stale" | "fetching" | "inactive" = "fresh";
      if (state.fetchStatus === "fetching") status = "fetching";
      else if (query.isStale()) status = "stale";
      else if (query.getObserversCount() === 0) status = "inactive";

      return {
        queryKey: JSON.stringify(query.queryKey),
        status,
        dataUpdatedAt: state.dataUpdatedAt
          ? new Date(state.dataUpdatedAt).toLocaleTimeString()
          : "—",
        fetchCount: state.dataUpdateCount,
        observerCount: query.getObserversCount(),
        isStale: query.isStale(),
        dataSize,
        rawData: state.data,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, forceUpdate]);

  const filtered = search
    ? queries.filter((q) => q.queryKey.toLowerCase().includes(search.toLowerCase()))
    : queries;

  const statusBadge = (status: string) => {
    switch (status) {
      case "fresh":
        return <Badge variant="success">Fresh</Badge>;
      case "stale":
        return <Badge variant="warning">Stale</Badge>;
      case "fetching":
        return <Badge variant="primary">Fetching</Badge>;
      case "inactive":
        return <Badge variant="default">Inactive</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {queries.length} queries in cache
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh}>
            <Icon name="refresh" size={14} /> Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries();
              refresh();
            }}
          >
            <Icon name="zap" size={14} /> Invalidate All
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search query keys..."
        value={search}
        onChange={(v) => setSearch(v)}
        leftIcon={<Icon name="search" size={16} />}
      />

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 font-semibold text-gray-700 w-8"></th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Query Key</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Status</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Observers</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Fetches</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Size</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => {
              const isExpanded = expandedKey === q.queryKey;
              return (
                <tr key={q.queryKey} className="border-b border-gray-100">
                  <td className="px-2 py-2">
                    <button
                      onClick={() => setExpandedKey(isExpanded ? null : q.queryKey)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Icon name={isExpanded ? "chevron-down" : "chevron-right"} size={14} className="text-gray-400" />
                    </button>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-700 max-w-xs truncate">
                    {q.queryKey}
                  </td>
                  <td className="text-center px-3 py-2">{statusBadge(q.status)}</td>
                  <td className="text-center px-3 py-2 text-xs text-gray-600">{q.observerCount}</td>
                  <td className="text-center px-3 py-2 text-xs text-gray-600">{q.fetchCount}</td>
                  <td className="text-right px-3 py-2 text-xs text-gray-600">{q.dataSize}</td>
                  <td className="text-right px-3 py-2 text-xs text-gray-500">{q.dataUpdatedAt}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  {queries.length === 0 ? "No queries in cache" : "No queries match your filter"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
