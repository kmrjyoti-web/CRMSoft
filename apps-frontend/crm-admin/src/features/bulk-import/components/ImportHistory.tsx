"use client";

import { useState } from "react";
import { Icon, Button, SelectInput } from "@/components/ui";
import { LoadingSpinner, PageHeader } from "@/components/common";
import { useImportJobs } from "../hooks/useBulkImport";
import { bulkImportService } from "../services/bulk-import.service";
import type { ImportJob, ImportJobStatus } from "../types/bulk-import.types";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  UPLOADING: { bg: "#f3f4f6", text: "#6b7280", label: "Uploading" },
  PARSING: { bg: "#fef3c7", text: "#d97706", label: "Parsing" },
  PARSED: { bg: "#dbeafe", text: "#2563eb", label: "Parsed" },
  MAPPING: { bg: "#e0e7ff", text: "#4338ca", label: "Mapping" },
  MAPPED: { bg: "#e0e7ff", text: "#4338ca", label: "Mapped" },
  VALIDATING: { bg: "#fef3c7", text: "#d97706", label: "Validating" },
  VALIDATED: { bg: "#dbeafe", text: "#2563eb", label: "Validated" },
  REVIEWING: { bg: "#fce7f3", text: "#db2777", label: "Reviewing" },
  IMPORTING: { bg: "#fef3c7", text: "#d97706", label: "Importing" },
  COMPLETED: { bg: "#dcfce7", text: "#16a34a", label: "Completed" },
  FAILED: { bg: "#fee2e2", text: "#dc2626", label: "Failed" },
  CANCELLED: { bg: "#f3f4f6", text: "#9ca3af", label: "Cancelled" },
};

const FILTER_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "Importing", value: "IMPORTING" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function ImportHistory() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data: res, isLoading } = useImportJobs({
    page,
    limit: 20,
    ...(statusFilter ? { status: statusFilter as ImportJobStatus } : {}),
  });

  const jobs: ImportJob[] = Array.isArray(res?.data) ? res.data : [];

  const handleDownload = async (jobId: string) => {
    try {
      const blob = await bulkImportService.downloadReport(jobId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `import-report-${jobId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6">
      <PageHeader
        title="Import History"
        subtitle="View past import jobs and download reports"
      />

      {/* Filter */}
      <div style={{ marginBottom: 20, maxWidth: 200 }}>
        <SelectInput
          label="Status"
          options={FILTER_OPTIONS}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(String(v ?? "")); setPage(1); }}
          leftIcon={<Icon name="filter" size={16} />}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <Icon name="file-spreadsheet" size={48} />
          <p style={{ fontSize: 15, marginTop: 12 }}>No import jobs found</p>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 80px 80px 80px 80px 100px 80px",
              gap: 0,
              padding: "10px 16px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: 12,
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            <span>File</span>
            <span>Entity</span>
            <span>Total</span>
            <span>Created</span>
            <span>Updated</span>
            <span>Failed</span>
            <span>Status</span>
            <span>Report</span>
          </div>

          {/* Rows */}
          {jobs.map((j) => {
            const statusInfo = STATUS_COLORS[j.status] || STATUS_COLORS.UPLOADING;
            return (
              <div
                key={j.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 80px 80px 80px 80px 100px 80px",
                  gap: 0,
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  alignItems: "center",
                  fontSize: 13,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {j.fileName}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>
                    {formatDate(j.createdAt)} by {j.createdByName}
                  </p>
                </div>
                <span style={{ fontSize: 12 }}>{j.targetEntity}</span>
                <span>{j.totalRows}</span>
                <span style={{ color: "#16a34a" }}>{j.importedCount}</span>
                <span style={{ color: "#3b82f6" }}>{j.updatedCount}</span>
                <span style={{ color: "#dc2626" }}>{j.failedCount}</span>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: statusInfo.bg,
                    color: statusInfo.text,
                    textAlign: "center",
                  }}
                >
                  {statusInfo.label}
                </span>
                <div>
                  {j.status === "COMPLETED" && (
                    <button
                      type="button"
                      title="Download report"
                      onClick={() => handleDownload(j.id)}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#3b82f6",
                      }}
                    >
                      <Icon name="download" size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {jobs.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 20,
          }}
        >
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={jobs.length < 20}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
