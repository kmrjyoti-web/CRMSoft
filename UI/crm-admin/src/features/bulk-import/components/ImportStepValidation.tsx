"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Icon, Button, SelectInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common";
import {
  useValidationSummary,
  useImportRows,
  useRowAction,
  useBulkRowAction,
  useValidateImport,
} from "../hooks/useBulkImport";
import type { ImportJob, ImportRow, ImportRowStatus } from "../types/bulk-import.types";

const ROW_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  VALID: { bg: "#dcfce7", text: "#16a34a", label: "Valid" },
  INVALID: { bg: "#fee2e2", text: "#dc2626", label: "Invalid" },
  DUPLICATE_EXACT: { bg: "#fef3c7", text: "#d97706", label: "Exact Dup" },
  DUPLICATE_FUZZY: { bg: "#fef9c3", text: "#ca8a04", label: "Fuzzy Dup" },
  DUPLICATE_IN_FILE: { bg: "#fce7f3", text: "#db2777", label: "In-File Dup" },
  PENDING: { bg: "#f3f4f6", text: "#6b7280", label: "Pending" },
  IMPORTED: { bg: "#dbeafe", text: "#2563eb", label: "Imported" },
  FAILED: { bg: "#fee2e2", text: "#dc2626", label: "Failed" },
  SKIPPED: { bg: "#f3f4f6", text: "#9ca3af", label: "Skipped" },
};

const FILTER_OPTIONS = [
  { label: "All Rows", value: "" },
  { label: "Valid", value: "VALID" },
  { label: "Invalid", value: "INVALID" },
  { label: "Duplicates (Exact)", value: "DUPLICATE_EXACT" },
  { label: "Duplicates (Fuzzy)", value: "DUPLICATE_FUZZY" },
  { label: "Pending", value: "PENDING" },
];

interface ImportStepValidationProps {
  job: ImportJob;
  onCommit: () => void;
}

export function ImportStepValidation({ job, onCommit }: ImportStepValidationProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data: summaryRes, isLoading: loadingSummary } = useValidationSummary(job.id);
  const { data: rowsRes, isLoading: loadingRows } = useImportRows(job.id, {
    page,
    limit: 20,
    ...(statusFilter ? { rowStatus: statusFilter as ImportRowStatus } : {}),
  });

  const validateMut = useValidateImport();
  const rowActionMut = useRowAction();
  const bulkActionMut = useBulkRowAction();

  const summary = summaryRes?.data;
  const rows: ImportRow[] = Array.isArray(rowsRes?.data) ? rowsRes.data : [];

  const needsValidation = job.status === "MAPPED" || job.status === "MAPPING";

  const handleValidate = () => {
    validateMut.mutate(job.id, {
      onSuccess: () => toast.success("Validation started"),
      onError: () => toast.error("Validation failed"),
    });
  };

  const handleRowAction = (rowId: string, action: string) => {
    rowActionMut.mutate({ jobId: job.id, rowId, action });
  };

  const handleBulkAction = (action: string) => {
    bulkActionMut.mutate(
      { jobId: job.id, action },
      { onSuccess: () => toast.success("Bulk action applied") },
    );
  };

  return (
    <div>
      {/* Trigger Validation */}
      {needsValidation && (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            marginBottom: 20,
            background: "#f9fafb",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
        >
          <Icon name="check-square" size={36} color="#3b82f6" />
          <p style={{ fontSize: 15, fontWeight: 500, marginTop: 12 }}>
            Mapping complete. Ready to validate {job.totalRows} rows.
          </p>
          <Button
            variant="primary"
            onClick={handleValidate}
            loading={validateMut.isPending}
            style={{ marginTop: 16 }}
          >
            <Icon name="check" size={16} />
            Start Validation
          </Button>
        </div>
      )}

      {/* Validating Spinner */}
      {job.status === "VALIDATING" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <LoadingSpinner />
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 12 }}>
            Validating rows and checking for duplicates...
          </p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Total", value: summary.totalRows, color: "#374151" },
            { label: "Valid", value: summary.validRows, color: "#16a34a" },
            { label: "Invalid", value: summary.invalidRows, color: "#dc2626" },
            { label: "Exact Dup", value: summary.duplicateExactRows, color: "#d97706" },
            { label: "Fuzzy Dup", value: summary.duplicateFuzzyRows, color: "#ca8a04" },
            { label: "In-File Dup", value: summary.duplicateInFileRows, color: "#db2777" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "12px 16px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      {summary && (job.status === "VALIDATED" || job.status === "REVIEWING") && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("ACCEPT_ALL_VALID")}
            loading={bulkActionMut.isPending}
          >
            Accept All Valid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("SKIP_ALL_DUPLICATES")}
          >
            Skip All Duplicates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("SKIP_ALL_INVALID")}
          >
            Skip All Invalid
          </Button>
        </div>
      )}

      {/* Filter */}
      {(job.status === "VALIDATED" || job.status === "REVIEWING") && (
        <div style={{ marginBottom: 16, maxWidth: 200 }}>
          <SelectInput
            label="Filter by Status"
            options={FILTER_OPTIONS}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(String(v ?? "")); setPage(1); }}
          />
        </div>
      )}

      {/* Row Table */}
      {loadingRows ? (
        <LoadingSpinner />
      ) : rows.length > 0 ? (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 100px 120px",
              padding: "8px 16px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: 12,
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            <span>Row</span>
            <span>Data</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {rows.map((row) => {
            const statusInfo = ROW_STATUS_COLORS[row.rowStatus] || ROW_STATUS_COLORS.PENDING;
            const data = row.mappedData || row.rowData;
            const dataPreview = Object.entries(data)
              .slice(0, 4)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" | ");

            return (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 100px 120px",
                  padding: "10px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                <span style={{ fontWeight: 600, color: "#6b7280" }}>#{row.rowNumber}</span>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "#374151",
                    }}
                  >
                    {dataPreview}
                  </p>
                  {row.validationErrors && row.validationErrors.length > 0 && (
                    <p style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>
                      {row.validationErrors.map((e) => e.message).join("; ")}
                    </p>
                  )}
                  {row.isDuplicate && row.duplicateMatchField && (
                    <p style={{ color: "#d97706", fontSize: 11, marginTop: 2 }}>
                      Duplicate on: {row.duplicateMatchField} = {row.duplicateMatchValue}
                      {row.fuzzyMatchScore
                        ? ` (${(row.fuzzyMatchScore * 100).toFixed(0)}% match)`
                        : ""}
                    </p>
                  )}
                </div>
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
                <div style={{ display: "flex", gap: 4 }}>
                  {!row.userAction && row.rowStatus !== "VALID" && row.rowStatus !== "IMPORTED" && (
                    <>
                      <button
                        type="button"
                        title="Accept"
                        onClick={() => handleRowAction(row.id, "ACCEPT")}
                        style={{
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          borderRadius: 4,
                          padding: "2px 6px",
                          cursor: "pointer",
                          fontSize: 11,
                          color: "#16a34a",
                        }}
                      >
                        <Icon name="check" size={12} />
                      </button>
                      <button
                        type="button"
                        title="Skip"
                        onClick={() => handleRowAction(row.id, "SKIP")}
                        style={{
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          borderRadius: 4,
                          padding: "2px 6px",
                          cursor: "pointer",
                          fontSize: 11,
                          color: "#dc2626",
                        }}
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </>
                  )}
                  {row.userAction && (
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{row.userAction}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Pagination */}
      {rows.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 16,
          }}
        >
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={rows.length < 20}>
            Next
          </Button>
        </div>
      )}

      {/* Commit Button */}
      {(job.status === "VALIDATED" || job.status === "REVIEWING") && (
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" onClick={onCommit}>
            <Icon name="upload" size={16} />
            Start Import
          </Button>
        </div>
      )}
    </div>
  );
}
