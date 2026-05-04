"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { Icon, Button, SelectInput, Badge } from "@/components/ui";
import { bulkImportService } from "../services/bulk-import.service";
import {
  useValidationSummary,
  useImportRows,
  useRowAction,
  useBulkRowAction,
  useValidateImport,
} from "../hooks/useBulkImport";
import type { ImportJob, ImportRow, ImportRowStatus } from "../types/bulk-import.types";

// ── Status config ──────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  VALID:             { bg: "bg-green-50",  text: "text-green-700",  label: "Valid",        icon: "check-circle" },
  INVALID:           { bg: "bg-red-50",    text: "text-red-700",    label: "Invalid",      icon: "x-circle" },
  DUPLICATE_EXACT:   { bg: "bg-amber-50",  text: "text-amber-700",  label: "Exact Dup",    icon: "copy" },
  DUPLICATE_FUZZY:   { bg: "bg-yellow-50", text: "text-yellow-700", label: "Fuzzy Dup",    icon: "search" },
  DUPLICATE_IN_FILE: { bg: "bg-pink-50",   text: "text-pink-700",   label: "In-File Dup",  icon: "file-minus" },
  PENDING:           { bg: "bg-gray-50",   text: "text-gray-500",   label: "Pending",      icon: "clock" },
  IMPORTED:          { bg: "bg-blue-50",   text: "text-blue-700",   label: "Imported",     icon: "check" },
  FAILED:            { bg: "bg-red-50",    text: "text-red-700",    label: "Failed",       icon: "alert-triangle" },
  SKIPPED:           { bg: "bg-gray-50",   text: "text-gray-400",   label: "Skipped",      icon: "minus-circle" },
};

const FILTER_OPTIONS = [
  { label: "All Rows", value: "" },
  { label: "Valid", value: "VALID" },
  { label: "Invalid", value: "INVALID" },
  { label: "Duplicates (Exact)", value: "DUPLICATE_EXACT" },
  { label: "Duplicates (Fuzzy)", value: "DUPLICATE_FUZZY" },
  { label: "In-File Duplicates", value: "DUPLICATE_IN_FILE" },
  { label: "Pending", value: "PENDING" },
];

// ── Props ──────────────────────────────────────────────

interface ImportStepValidationProps {
  job: ImportJob;
  onCommit: () => void;
}

// ── Component ──────────────────────────────────────────

export function ImportStepValidation({ job, onCommit }: ImportStepValidationProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [validating, setValidating] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [progress, setProgress] = useState({ valid: 0, invalid: 0, duplicate: 0, total: job.totalRows, status: job.status });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: summaryRes, isLoading: loadingSummary, refetch: refetchSummary } = useValidationSummary(job.id);
  const { data: rowsRes, isLoading: loadingRows, refetch: refetchRows } = useImportRows(job.id, {
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
  const isValidating = validating || job.status === "VALIDATING";
  const isValidated = job.status === "VALIDATED" || job.status === "REVIEWING";

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleValidate = () => {
    setValidating(true);
    setProgress({ valid: 0, invalid: 0, duplicate: 0, total: job.totalRows, status: "VALIDATING" });

    validateMut.mutate(job.id, {
      onSuccess: () => {
        pollRef.current = setInterval(async () => {
          try {
            const res = await bulkImportService.getStatus(job.id);
            const data = res?.data ?? res;
            setProgress({
              valid: data.validRows ?? 0,
              invalid: data.invalidRows ?? 0,
              duplicate: (data.duplicateExactRows ?? 0) + (data.duplicateFuzzyRows ?? 0) + (data.duplicateInFileRows ?? 0),
              total: data.totalRows ?? job.totalRows,
              status: data.status,
            });
            if (["VALIDATED", "VALIDATED_WITH_ERRORS", "REVIEWING"].includes(data.status)) {
              if (pollRef.current) clearInterval(pollRef.current);
              setValidating(false);
              refetchSummary();
              refetchRows();
              toast.success("Validation complete");
            }
          } catch { /* keep polling */ }
        }, 2000);
      },
      onError: () => { setValidating(false); toast.error("Validation failed to start"); },
    });
  };

  const handleRowAction = useCallback((rowId: string, action: string) => {
    rowActionMut.mutate(
      { jobId: job.id, rowId, action },
      { onSuccess: () => refetchRows() },
    );
  }, [rowActionMut, job.id, refetchRows]);

  const handleBulkAction = useCallback((action: string) => {
    bulkActionMut.mutate(
      { jobId: job.id, action },
      { onSuccess: () => { toast.success("Action applied"); refetchRows(); refetchSummary(); } },
    );
  }, [bulkActionMut, job.id, refetchRows, refetchSummary]);

  const processed = progress.valid + progress.invalid + progress.duplicate;
  const pct = progress.total > 0 ? Math.round((processed / progress.total) * 100) : 0;

  // ── Render: Trigger Validation ───────────────────────

  if (needsValidation && !isValidating) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <Icon name="shield-check" size={32} color="#3b82f6" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Ready to Validate</h3>
        <p className="text-sm text-gray-500 mb-6">
          {job.totalRows} rows mapped. Click below to check for errors and duplicates.
        </p>
        <Button variant="primary" onClick={handleValidate} disabled={validateMut.isPending}>
          <Icon name="play" size={14} />
          Validate {job.totalRows} Rows
        </Button>
      </div>
    );
  }

  // ── Render: Validating Progress ──────────────────────

  if (isValidating) {
    return (
      <div className="py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="animate-spin w-5 h-5 border-[3px] border-blue-200 border-t-blue-600 rounded-full" />
            <span className="text-sm font-semibold text-blue-800">
              Validating {processed} of {progress.total} rows...
            </span>
            <span className="ml-auto text-sm font-bold text-blue-700">{pct}%</span>
          </div>

          <div className="bg-blue-100 rounded-full h-2.5 overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #3b82f6, #2563eb)" }} />
          </div>

          <div className="flex gap-6 text-sm">
            <Stat color="green" count={progress.valid} label="valid" />
            <Stat color="red" count={progress.invalid} label="errors" />
            <Stat color="amber" count={progress.duplicate} label="duplicates" />
            <Stat color="gray" count={progress.total - processed} label="pending" />
          </div>
        </div>

        {/* Skeleton rows */}
        <div className="mt-5 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-3 w-8 bg-gray-200 rounded" />
              <div className="h-3 flex-1 bg-gray-200 rounded" style={{ maxWidth: `${55 + i * 8}%` }} />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Render: Validated — Summary + Rows ───────────────

  return (
    <div>
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          <SummaryCard label="Total" value={summary.totalRows} color="#374151" icon="database" />
          <SummaryCard label="Valid" value={summary.validRows} color="#16a34a" icon="check-circle" onClick={() => { setStatusFilter("VALID"); setPage(1); }} />
          <SummaryCard label="Invalid" value={summary.invalidRows} color="#dc2626" icon="x-circle" onClick={() => { setStatusFilter("INVALID"); setPage(1); }} />
          <SummaryCard label="Exact Dup" value={summary.duplicateExactRows} color="#d97706" icon="copy" onClick={() => { setStatusFilter("DUPLICATE_EXACT"); setPage(1); }} />
          <SummaryCard label="Fuzzy Dup" value={summary.duplicateFuzzyRows ?? 0} color="#ca8a04" icon="search" onClick={() => { setStatusFilter("DUPLICATE_FUZZY"); setPage(1); }} />
          <SummaryCard label="In-File Dup" value={summary.duplicateInFileRows ?? 0} color="#db2777" icon="file-minus" onClick={() => { setStatusFilter("DUPLICATE_IN_FILE"); setPage(1); }} />
        </div>
      )}

      {/* Toolbar: Filter + Bulk Actions */}
      {isValidated && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="w-44">
            <SelectInput
              label=""
              placeholder="Filter rows..."
              options={FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(String(v ?? "")); setPage(1); }}
              clearable
            />
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction("ACCEPT_ALL_VALID")} loading={bulkActionMut.isPending}>
              <Icon name="check-circle" size={13} /> Accept All Valid
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction("SKIP_ALL_DUPLICATES")}>
              <Icon name="minus-circle" size={13} /> Skip Duplicates
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction("SKIP_ALL_INVALID")}>
              <Icon name="x-circle" size={13} /> Skip Invalid
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loadingRows && (
        <div className="text-center py-8 text-sm text-gray-400">Loading rows...</div>
      )}

      {/* Row List */}
      {!loadingRows && rows.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[50px_1fr_90px_80px] px-4 py-2 bg-gray-50 border-b text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            <span>#</span>
            <span>Row Data</span>
            <span className="text-center">Status</span>
            <span className="text-center">Action</span>
          </div>

          {/* Rows */}
          {rows.map((row) => {
            const sc = STATUS_CONFIG[row.rowStatus] || STATUS_CONFIG.PENDING;
            const data = (row.mappedData && Object.keys(row.mappedData).length > 0) ? row.mappedData : row.rowData;
            const entries = Object.entries(data).filter(([, v]) => v != null && v !== "");
            const isExpanded = expandedRow === row.id;
            const hasErrors = row.validationErrors?.length > 0;

            return (
              <div key={row.id} className={`border-b border-gray-100 ${hasErrors ? "bg-red-50/30" : ""}`}>
                {/* Main Row */}
                <div
                  className="grid grid-cols-[50px_1fr_90px_80px] px-4 py-2.5 items-center cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                >
                  <span className="text-xs font-semibold text-gray-400">#{row.rowNumber}</span>

                  {/* Data Preview */}
                  <div className="min-w-0 pr-2">
                    <div className="flex flex-wrap gap-1.5">
                      {entries.slice(0, 4).map(([key, val]) => (
                        <span key={key} className="inline-flex items-center gap-1 text-[11px]">
                          <span className="text-gray-400 font-medium">{key}:</span>
                          <span className="text-gray-700 font-medium truncate max-w-[120px]">{String(val)}</span>
                        </span>
                      ))}
                      {entries.length > 4 && (
                        <span className="text-[10px] text-gray-400">+{entries.length - 4} more</span>
                      )}
                    </div>

                    {/* Inline error preview */}
                    {hasErrors && (
                      <div className="flex items-center gap-1 mt-1">
                        <Icon name="alert-circle" size={11} color="#dc2626" />
                        <span className="text-[11px] text-red-600">
                          {row.validationErrors.slice(0, 2).map((e: any) => e.message || e.field).join(", ")}
                          {row.validationErrors.length > 2 && ` +${row.validationErrors.length - 2}`}
                        </span>
                      </div>
                    )}

                    {/* Duplicate info */}
                    {row.isDuplicate && row.duplicateMatchField && (
                      <div className="flex items-center gap-1 mt-1">
                        <Icon name="copy" size={11} color="#d97706" />
                        <span className="text-[11px] text-amber-600">
                          Match on {row.duplicateMatchField}: {row.duplicateMatchValue}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                      <Icon name={sc.icon as any} size={10} />
                      {sc.label}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {!row.userAction && !["VALID", "IMPORTED", "SKIPPED"].includes(row.rowStatus) && (
                      <>
                        <button
                          onClick={() => handleRowAction(row.id, "ACCEPT")}
                          className="w-6 h-6 rounded flex items-center justify-center border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                          title="Accept"
                        >
                          <Icon name="check" size={12} />
                        </button>
                        <button
                          onClick={() => handleRowAction(row.id, "SKIP")}
                          className="w-6 h-6 rounded flex items-center justify-center border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="Skip"
                        >
                          <Icon name="x" size={12} />
                        </button>
                      </>
                    )}
                    {row.userAction && (
                      <Badge variant={row.userAction === "ACCEPT" ? "success" : "secondary"}>
                        {row.userAction}
                      </Badge>
                    )}
                    {row.rowStatus === "VALID" && !row.userAction && (
                      <Icon name="check-circle" size={14} color="#16a34a" />
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 bg-gray-50/50 border-t border-gray-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                      {entries.map(([key, val]) => (
                        <div key={key}>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{key}</span>
                          <p className="text-xs text-gray-800 mt-0.5 break-words">{String(val)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Validation Errors Detail */}
                    {hasErrors && (
                      <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wide mb-1.5">Validation Errors</p>
                        {row.validationErrors.map((err: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-red-700 mb-1">
                            <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-[9px] font-bold mt-0.5">{i + 1}</span>
                            <span><strong>{err.field}:</strong> {err.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loadingRows && rows.length === 0 && statusFilter && (
        <div className="text-center py-8 text-sm text-gray-400">
          No rows match filter &ldquo;{FILTER_OPTIONS.find(f => f.value === statusFilter)?.label}&rdquo;
        </div>
      )}

      {/* Pagination */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-xs text-gray-400">
            Page {page} &middot; Showing {rows.length} rows
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <Icon name="chevron-left" size={14} /> Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={rows.length < 20}>
              Next <Icon name="chevron-right" size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Commit Button */}
      {isValidated && summary && (
        <div className="mt-6 flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
          <div>
            <p className="text-sm font-semibold text-green-800">
              Ready to import {summary.validRows} of {summary.totalRows} rows
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              {summary.invalidRows > 0 && `${summary.invalidRows} invalid will be skipped. `}
              {(summary.duplicateExactRows + (summary.duplicateFuzzyRows ?? 0)) > 0 &&
                `${summary.duplicateExactRows + (summary.duplicateFuzzyRows ?? 0)} duplicates found.`}
            </p>
          </div>
          <Button variant="primary" onClick={onCommit} disabled={summary.validRows === 0}>
            <Icon name="upload" size={14} />
            Start Import ({summary.validRows})
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────

function Stat({ color, count, label }: { color: string; count: number; label: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-500 text-green-700",
    red: "bg-red-500 text-red-700",
    amber: "bg-amber-500 text-amber-700",
    gray: "bg-gray-300 text-gray-600",
  };
  const [dot, text] = (colors[color] || colors.gray).split(" ");
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
      <span className={`font-semibold ${text}`}>{count}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  );
}

function SummaryCard({ label, value, color, icon, onClick }: { label: string; value: number; color: string; icon: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 bg-white border border-gray-200 rounded-xl text-center transition-all ${onClick ? "hover:border-gray-400 hover:shadow-sm cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Icon name={icon as any} size={14} color={color} />
        <span className="text-xl font-bold" style={{ color }}>{value}</span>
      </div>
      <p className="text-[10px] text-gray-500 font-medium">{label}</p>
    </button>
  );
}
