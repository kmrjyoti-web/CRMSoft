"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

import { Icon, Button, Badge } from "@/components/ui";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

import { useExportJobs, useDownloadExport } from "../hooks/useBulkExport";

import type { ExportJob, ExportStatus } from "../types/bulk-export.types";

// ── Helpers ─────────────────────────────────────────────

const STATUS_BADGE: Record<ExportStatus, "warning" | "primary" | "success" | "danger"> = {
  PENDING: "warning",
  PROCESSING: "primary",
  COMPLETED: "success",
  FAILED: "danger",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "\u2014";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ───────────────────────────────────────────

export function ExportJobList() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useExportJobs({ page, limit });
  const downloadExport = useDownloadExport();

  const jobs = useMemo(() => {
    const raw = data?.data ?? data;
    return (Array.isArray(raw) ? raw : []) as ExportJob[];
  }, [data]);

  // ── Auto-polling for pending/processing jobs ──────────

  const hasActiveJobs = useMemo(
    () =>
      jobs.some((j) => j.status === "PENDING" || j.status === "PROCESSING"),
    [jobs],
  );

  useEffect(() => {
    if (!hasActiveJobs) return;
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [hasActiveJobs, refetch]);

  // ── Download handler ──────────────────────────────────

  const handleDownload = useCallback(
    (job: ExportJob) => {
      downloadExport.mutate(job.id, {
        onSuccess: (blob) => {
          const url = URL.createObjectURL(blob as Blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = job.fileName ?? `export-${job.id}.${job.format.toLowerCase()}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
      });
    },
    [downloadExport],
  );

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Export History"
        subtitle="View and download your data exports"
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Icon name="refresh-cw" size={14} />
            Refresh
          </Button>
        }
      />

      {/* Active jobs indicator */}
      {hasActiveJobs && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 12,
            marginBottom: 16,
            background: "#fefce8",
            borderRadius: 8,
            border: "1px solid #fde68a",
          }}
        >
          <Icon name="clock" size={16} color="#ca8a04" />
          <span style={{ fontSize: 13, color: "#854d0e" }}>
            Some exports are still being processed. This page will auto-refresh.
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>
          Loading exports...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && jobs.length === 0 && (
        <EmptyState
          icon="download"
          title="No Export Jobs"
          description="Export jobs will appear here when you export data from any list page."
        />
      )}

      {/* Jobs Table */}
      {!isLoading && jobs.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {[
                  "File / Entity",
                  "Format",
                  "Status",
                  "Rows",
                  "Size",
                  "Created By",
                  "Created At",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "10px 14px" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {job.fileName ?? `${job.targetEntity} export`}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {job.targetEntity}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge variant="outline">{job.format}</Badge>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge variant={STATUS_BADGE[job.status]}>
                      {job.status}
                    </Badge>
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    {job.totalRows > 0 ? job.totalRows.toLocaleString() : "\u2014"}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    {formatFileSize(job.fileSize)}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    {job.createdByName}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    {formatDate(job.createdAt)}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {job.status === "COMPLETED" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(job)}
                        disabled={downloadExport.isPending}
                        title="Download"
                      >
                        <Icon name="download" size={14} color="#3b82f6" />
                      </Button>
                    ) : job.status === "FAILED" ? (
                      <span
                        title={job.errorMessage ?? "Export failed"}
                        style={{ cursor: "help" }}
                      >
                        <Icon name="alert-circle" size={16} color="#ef4444" />
                      </span>
                    ) : (
                      <Icon name="clock" size={16} color="#f59e0b" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
              padding: "12px 14px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <Icon name="chevron-left" size={14} />
              Previous
            </Button>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={jobs.length < limit}
            >
              Next
              <Icon name="chevron-right" size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
