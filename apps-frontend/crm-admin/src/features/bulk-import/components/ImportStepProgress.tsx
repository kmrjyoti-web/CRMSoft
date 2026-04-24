"use client";

import { Icon, Button } from "@/components/ui";
import { LoadingSpinner } from "@/components/common";
import { useImportJob, useImportResult } from "../hooks/useBulkImport";
import { bulkImportService } from "../services/bulk-import.service";
import type { ImportJob } from "../types/bulk-import.types";

interface ImportStepProgressProps {
  job: ImportJob;
  onDone: () => void;
}

export function ImportStepProgress({ job, onDone }: ImportStepProgressProps) {
  // Auto-refetch while importing
  const { data: freshRes } = useImportJob(job.id);
  const liveJob = freshRes?.data ?? job;

  const { data: resultRes } = useImportResult(
    liveJob.status === "COMPLETED" || liveJob.status === "FAILED" ? job.id : "",
  );
  const result = resultRes?.data;

  const isImporting = liveJob.status === "IMPORTING";
  const isCompleted = liveJob.status === "COMPLETED";
  const isFailed = liveJob.status === "FAILED";

  const total = liveJob.totalRows || 1;
  const processed = liveJob.importedCount + liveJob.failedCount + liveJob.skippedRows + liveJob.updatedCount;
  const pct = Math.min(100, Math.round((processed / total) * 100));

  const handleDownload = async () => {
    try {
      const blob = await bulkImportService.downloadReport(job.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `import-report-${job.id}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
      {/* Progress */}
      {isImporting && (
        <>
          <LoadingSpinner />
          <p style={{ fontSize: 16, fontWeight: 600, marginTop: 16 }}>
            Importing data...
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            {processed} of {total} rows processed
          </p>

          {/* Progress Bar */}
          <div
            style={{
              marginTop: 20,
              height: 10,
              background: "#f3f4f6",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "linear-gradient(90deg, #3b82f6, #2563eb)",
                borderRadius: 10,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>{pct}%</p>
        </>
      )}

      {/* Completed */}
      {isCompleted && (
        <>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#dcfce7",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Icon name="check-circle" size={32} color="#16a34a" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Import Complete!</h3>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Your data has been successfully imported.
          </p>

          {/* Result Stats */}
          {result && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                marginTop: 24,
                textAlign: "center",
              }}
            >
              {[
                { label: "Created", value: result.importedCount, color: "#16a34a" },
                { label: "Updated", value: result.updatedCount, color: "#3b82f6" },
                { label: "Skipped", value: result.skippedRows, color: "#9ca3af" },
                { label: "Failed", value: result.failedCount, color: "#dc2626" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: "14px 8px",
                    background: "#f9fafb",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <p style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 28 }}>
            <Button variant="outline" onClick={handleDownload}>
              <Icon name="download" size={16} />
              Download Report
            </Button>
            <Button variant="primary" onClick={onDone}>
              Done
            </Button>
          </div>
        </>
      )}

      {/* Failed */}
      {isFailed && (
        <>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Icon name="x-circle" size={32} color="#dc2626" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>Import Failed</h3>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            {liveJob.errorMessage || "An error occurred during import."}
          </p>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 12 }}>
            <Button variant="outline" onClick={handleDownload}>
              <Icon name="download" size={16} />
              Download Report
            </Button>
            <Button variant="primary" onClick={onDone}>
              Back to Import
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
