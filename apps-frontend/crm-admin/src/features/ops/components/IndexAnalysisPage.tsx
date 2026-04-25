"use client";

import { useState } from "react";
import { useIndexStats, useRunReindex } from "../hooks/useOps";
import type { IndexStat } from "../types/ops.types";

export function IndexAnalysisPage() {
  const stats = useIndexStats();
  const reindex = useRunReindex();
  const [filter, setFilter] = useState<"all" | "unused">("unused");

  const items = (stats.data?.data?.unused || []) as IndexStat[];
  const displayed = filter === "unused" ? items.filter((i) => i.isUnused) : items;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Index Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Total indexes: {stats.data?.data?.total ?? "—"} | Unused: {items.filter((i) => i.isUnused).length}
        </p>
      </div>

      {/* Duplicates */}
      {(stats.data?.data?.duplicate?.length || 0) > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Duplicate Indexes Detected</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {stats.data!.data!.duplicate.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("unused")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === "unused" ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600"}`}
        >
          Unused (&lt;50 scans)
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === "all" ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600"}`}
        >
          All low-scan indexes
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {stats.isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Index", "Table", "Size", "Scans", "Unique", "Unused", "Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((idx) => (
                  <tr key={idx.indexName} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{idx.indexName}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{idx.tableName}</td>
                    <td className="px-3 py-2">{idx.indexSize}</td>
                    <td className="px-3 py-2 text-right">{idx.indexScans}</td>
                    <td className="px-3 py-2 text-center">{idx.isUnique ? "✓" : "—"}</td>
                    <td className="px-3 py-2 text-center">
                      {idx.isUnused ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">Unused</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => reindex.mutate({ indexName: idx.indexName })}
                        disabled={reindex.isPending}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50"
                      >
                        REINDEX
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayed.length === 0 && (
              <p className="p-6 text-center text-gray-400 text-sm">No indexes match the current filter</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
