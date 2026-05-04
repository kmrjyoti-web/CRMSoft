"use client";

import { useState } from "react";
import {
  useTableStats,
  useConnectionPool,
  useBloatAnalysis,
  useSlowQueries,
  useRunVacuum,
  useRunAnalyze,
} from "../hooks/useOps";
import type { TableStat } from "../types/ops.types";

export function DbMaintenancePage() {
  const [tab, setTab] = useState<"tables" | "bloat" | "slow-queries" | "connections">("tables");

  const tables = useTableStats();
  const pool = useConnectionPool();
  const bloat = useBloatAnalysis();
  const slowQ = useSlowQueries();
  const vacuum = useRunVacuum();
  const analyze = useRunAnalyze();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DB Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">Table stats, bloat, slow queries, and maintenance operations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => vacuum.mutate({})}
            disabled={vacuum.isPending}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {vacuum.isPending ? "Running…" : "VACUUM ANALYZE"}
          </button>
          <button
            onClick={() => analyze.mutate({})}
            disabled={analyze.isPending}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {analyze.isPending ? "Running…" : "ANALYZE ALL"}
          </button>
        </div>
      </div>

      {/* Connection pool card */}
      {pool.data?.data && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Connection Pool</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <PoolStat label="Total" value={pool.data.data.total} />
            <PoolStat label="Active" value={pool.data.data.active} color="text-blue-600" />
            <PoolStat label="Idle" value={pool.data.data.idle} color="text-green-600" />
            <PoolStat label="Waiting" value={pool.data.data.waiting} color="text-yellow-600" />
            <PoolStat
              label="Utilization"
              value={`${pool.data.data.utilizationPercent}%`}
              color={pool.data.data.utilizationPercent > 80 ? "text-red-600" : "text-green-600"}
            />
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  pool.data.data.utilizationPercent > 80 ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${pool.data.data.utilizationPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{pool.data.data.total} / {pool.data.data.maxConnections} max connections</p>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 text-sm font-medium">
          {(["tables", "bloat", "slow-queries", "connections"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 capitalize border-b-2 transition-colors ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.replace("-", " ")}
            </button>
          ))}
        </nav>
      </div>

      {/* Tables tab */}
      {tab === "tables" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {tables.isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading table stats…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Table", "Rows", "Total Size", "Index Size", "Bloat %", "Last Vacuum", "Last Analyze"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(tables.data?.data as TableStat[] || []).map((t) => (
                    <tr key={t.tableName} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs">{t.tableName}</td>
                      <td className="px-3 py-2 text-right">{t.rowCount.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-right">{t.totalSize}</td>
                      <td className="px-3 py-2 text-right">{t.indexSize}</td>
                      <td className={`px-3 py-2 text-right font-medium ${t.bloatPercent > 30 ? "text-red-600" : ""}`}>
                        {t.bloatPercent}%
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-400">
                        {t.lastVacuum ? new Date(t.lastVacuum).toLocaleDateString("en-IN") : "Never"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-400">
                        {t.lastAnalyze ? new Date(t.lastAnalyze).toLocaleDateString("en-IN") : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bloat tab */}
      {tab === "bloat" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Table Bloat</h3>
            </div>
            {bloat.isLoading ? (
              <div className="p-8 text-center text-gray-400">Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Table", "Dead Tuples", "Live Tuples", "Bloat %", "Size", "Last Vacuum"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(bloat.data?.data?.tables || []).map((t) => (
                      <tr key={t.tableName}>
                        <td className="px-3 py-2 font-mono text-xs">{t.tableName}</td>
                        <td className="px-3 py-2 text-right text-red-600">{t.deadTuples.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-right">{t.liveTuples.toLocaleString("en-IN")}</td>
                        <td className={`px-3 py-2 text-right font-bold ${t.bloatPercent > 20 ? "text-red-600" : "text-yellow-600"}`}>
                          {t.bloatPercent}%
                        </td>
                        <td className="px-3 py-2">{t.tableSize}</td>
                        <td className="px-3 py-2 text-xs text-gray-400">
                          {t.lastVacuum ? new Date(t.lastVacuum).toLocaleDateString("en-IN") : "Never"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(bloat.data?.data?.tables?.length || 0) === 0 && (
                  <p className="p-6 text-center text-gray-400 text-sm">No significant bloat detected</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slow queries tab */}
      {tab === "slow-queries" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Slow Queries (pg_stat_statements)</h3>
          </div>
          {slowQ.isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : (slowQ.data?.data?.length || 0) === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm">pg_stat_statements not enabled or no slow queries</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {(slowQ.data?.data || []).map((q, i) => (
                <div key={i} className="p-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>calls: {q.calls} | mean: {q.meanTime}ms | total: {q.totalTime}ms</span>
                    <span>{q.rows} rows</span>
                  </div>
                  <pre className="text-xs font-mono text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                    {q.query.slice(0, 300)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PoolStat({ label, value, color = "text-gray-900" }: { label: string; value: string | number; color?: string }) {
  return (
    <div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
