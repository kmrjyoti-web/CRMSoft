"use client";

import { useState } from "react";
import { useBackups, useRunBackup, useRunBackupAll, usePgDumpStatus } from "../hooks/useOps";
import type { BackupLog, BackupSchema } from "../types/ops.types";

const SCHEMAS: BackupSchema[] = ["identity", "platform", "working", "marketplace"];
const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  RUNNING: "bg-blue-100 text-blue-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
};

export function BackupPage() {
  const [schema, setSchema] = useState<BackupSchema | "">("");
  const backups = useBackups(schema || undefined);
  const pgDump = usePgDumpStatus();
  const runOne = useRunBackup();
  const runAll = useRunBackupAll();

  const pgDumpAvailable = pgDump.data?.data?.available;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Backups</h1>
          <p className="text-sm text-gray-500 mt-1">pg_dump → Cloudflare R2 | Nightly 1 AM IST | 30-day retention</p>
        </div>
        <div className="flex gap-2">
          {!pgDump.isLoading && !pgDumpAvailable && (
            <span className="px-3 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-xs">
              pg_dump not available
            </span>
          )}
          <button
            onClick={() => runAll.mutate()}
            disabled={runAll.isPending || !pgDumpAvailable}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {runAll.isPending ? "Backing up…" : "Backup All Schemas"}
          </button>
        </div>
      </div>

      {/* Per-schema backup buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Backup Individual Schema</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCHEMAS.map((s) => (
            <button
              key={s}
              onClick={() => runOne.mutate({ schema: s })}
              disabled={runOne.isPending || !pgDumpAvailable}
              className="py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 capitalize"
            >
              {runOne.isPending ? "…" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSchema("")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!schema ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600"}`}
        >
          All Schemas
        </button>
        {SCHEMAS.map((s) => (
          <button
            key={s}
            onClick={() => setSchema(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${schema === s ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Backup list */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {backups.isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading backups…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Schema", "DB", "Status", "Size", "Triggered By", "Duration", "Expires", "Created"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(backups.data?.data as BackupLog[] || []).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/ops/backups/${b.id}`}>
                    <td className="px-3 py-2 capitalize font-medium">{b.schemaName}</td>
                    <td className="px-3 py-2 font-mono text-xs">{b.dbName}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || ""}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{b.sizeBytes ? formatBytes(Number(b.sizeBytes)) : "—"}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{b.triggeredBy}</td>
                    <td className="px-3 py-2 text-xs">{b.durationMs ? `${b.durationMs}ms` : "—"}</td>
                    <td className="px-3 py-2 text-xs text-gray-400">
                      {b.expiresAt ? new Date(b.expiresAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-400">
                      {new Date(b.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(backups.data?.data as BackupLog[] || []).length === 0 && (
              <p className="p-8 text-center text-gray-400 text-sm">No backups found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
