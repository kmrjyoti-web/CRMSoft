"use client";

import { useState } from "react";
import { useBackup, useRestoreBackup } from "../hooks/useOps";
import * as ops from "../services/ops.service";

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  RUNNING: "bg-blue-100 text-blue-700",
};

export function BackupDetailPage({ id }: { id: string }) {
  const { data, isLoading } = useBackup(id);
  const restore = useRestoreBackup();
  const [confirming, setConfirming] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const backup = data?.data;

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await ops.getBackupDownloadUrl(id);
      if (res.data?.url) {
        window.open(res.data.url, "_blank");
      }
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading backup details…</div>;
  }
  if (!backup) {
    return <div className="p-8 text-center text-gray-400">Backup not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup Detail</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">{backup.id}</p>
        </div>
        <div className="flex gap-2">
          {backup.r2Key && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {downloading ? "Getting URL…" : "Download"}
            </button>
          )}
          {backup.status === "SUCCESS" && (
            <button
              onClick={() => setConfirming(true)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Restore This Backup
            </button>
          )}
        </div>
      </div>

      {/* Confirm restore dialog */}
      {confirming && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Confirm Restore</h3>
          <p className="text-sm text-red-700 mb-3">
            This will overwrite the <strong>{backup.schemaName}</strong> database with data from{" "}
            <strong>{new Date(backup.createdAt).toLocaleString("en-IN")}</strong>. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                restore.mutate({ id: backup.id });
                setConfirming(false);
              }}
              disabled={restore.isPending}
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Yes, Restore
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-2 gap-4">
        <Detail label="Schema" value={backup.schemaName} />
        <Detail label="Database" value={backup.dbName} />
        <Detail label="Status">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[backup.status] || ""}`}>
            {backup.status}
          </span>
        </Detail>
        <Detail label="Size" value={backup.sizeBytes ? formatBytes(Number(backup.sizeBytes)) : "—"} />
        <Detail label="Duration" value={backup.durationMs ? `${backup.durationMs}ms` : "—"} />
        <Detail label="Triggered By" value={backup.triggeredBy} />
        <Detail label="Retention" value={`${backup.retentionDays} days`} />
        <Detail label="Expires" value={backup.expiresAt ? new Date(backup.expiresAt).toLocaleDateString("en-IN") : "—"} />
        <Detail label="Created" value={new Date(backup.createdAt).toLocaleString("en-IN")} />
        {backup.checksum && <Detail label="Checksum (SHA-256)" value={backup.checksum.slice(0, 16) + "…"} />}
      </div>

      {backup.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-1">Error</h3>
          <pre className="text-xs text-red-700 whitespace-pre-wrap">{backup.errorMessage}</pre>
        </div>
      )}

      {backup.r2Url && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">R2 Storage Location</h3>
          <p className="text-xs font-mono text-gray-500 break-all">{backup.r2Key}</p>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      {children ?? <p className="text-sm text-gray-800 mt-0.5">{value || "—"}</p>}
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
