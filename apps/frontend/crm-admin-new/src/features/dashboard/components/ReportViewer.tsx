"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button, DatePicker, SelectInput, Badge } from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { formatINR } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import {
  useReportDefinition,
  useGenerateReport,
  useExportReport,
} from "../hooks/useDashboard";
import { getDateRange } from "../utils/date-range";
import type {
  ReportResult,
  ExportFormat,
  ReportColumn,
} from "../types/dashboard.types";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const GROUP_BY_OPTIONS = [
  { label: "None", value: "" },
  { label: "User", value: "user" },
  { label: "Month", value: "month" },
  { label: "Source", value: "source" },
  { label: "Industry", value: "industry" },
  { label: "City", value: "city" },
  { label: "Product", value: "product" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function renderCellValue(col: ReportColumn, value: unknown): string {
  if (value == null) return "\u2014";
  if (col.type === "currency") return formatINR(Number(value));
  if (col.type === "date") return formatDate(String(value));
  return String(value);
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface ReportViewerProps {
  reportCode: string;
}

export function ReportViewer({ reportCode }: ReportViewerProps) {
  const router = useRouter();

  /* ---- state ---- */
  const initialRange = useMemo(() => getDateRange("30d"), []);
  const [dateFrom, setDateFrom] = useState<string>(initialRange.dateFrom);
  const [dateTo, setDateTo] = useState<string>(initialRange.dateTo);
  const [groupBy, setGroupBy] = useState<string>("");
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);

  /* ---- hooks ---- */
  const { data: defData, isLoading: defLoading } =
    useReportDefinition(reportCode);
  const generateMutation = useGenerateReport();
  const exportMutation = useExportReport();
  const definition = defData?.data;

  /* ---- handlers ---- */
  const handleGenerate = useCallback(async () => {
    try {
      const result = await generateMutation.mutateAsync({
        code: reportCode,
        params: { dateFrom, dateTo, groupBy: groupBy || undefined },
      });
      setReportResult(result.data);
      toast.success("Report generated");
    } catch {
      toast.error("Failed to generate report");
    }
  }, [reportCode, dateFrom, dateTo, groupBy, generateMutation]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      try {
        await exportMutation.mutateAsync({
          code: reportCode,
          params: { dateFrom, dateTo, groupBy: groupBy || undefined, format },
        });
        toast.success(`Export started (${format})`);
      } catch {
        toast.error("Export failed");
      }
    },
    [reportCode, dateFrom, dateTo, groupBy, exportMutation],
  );

  /* ---- loading state ---- */
  if (defLoading) return <LoadingSpinner fullPage />;

  /* ---- render ---- */
  return (
    <div>
      <PageHeader
        title={definition?.name ?? "Report"}
        subtitle={definition?.description}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {(["PDF", "EXCEL", "CSV"] as ExportFormat[]).map((fmt) => (
              <Button
                key={fmt}
                size="sm"
                variant="outline"
                disabled={!reportResult || exportMutation.isPending}
                onClick={() => handleExport(fmt)}
              >
                {fmt}
              </Button>
            ))}
          </div>
        }
      />

      {/* Filter bar */}
      <div
        className="rounded-lg border border-gray-200 bg-white p-5"
        style={{ marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <DatePicker
            label="From"
            value={dateFrom}
            onChange={(v) => setDateFrom(v)}
          />
          <DatePicker
            label="To"
            value={dateTo}
            onChange={(v) => setDateTo(v)}
          />
          <SelectInput
            label="Group By"
            options={GROUP_BY_OPTIONS}
            value={groupBy}
            onChange={(v) => setGroupBy(String(v ?? ""))}
          />
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        {generateMutation.isPending ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 40 }}
          >
            <LoadingSpinner />
          </div>
        ) : !reportResult ? (
          <EmptyState
            icon="bar-chart"
            title="Generate a report"
            description="Select a date range and click Generate to view results."
          />
        ) : reportResult.rows.length === 0 ? (
          <EmptyState
            icon="bar-chart"
            title="No data"
            description="No results found for the selected period."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #e2e8f0",
                    textAlign: "left",
                  }}
                >
                  {reportResult.columns.map((col: ReportColumn) => (
                    <th
                      key={col.key}
                      style={{
                        padding: "10px 12px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#475569",
                        textAlign:
                          col.type === "number" || col.type === "currency"
                            ? "right"
                            : "left",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportResult.rows.map(
                  (row: Record<string, unknown>, idx: number) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: "1px solid #e2e8f0" }}
                    >
                      {reportResult.columns.map((col: ReportColumn) => (
                        <td
                          key={col.key}
                          style={{
                            padding: "10px 12px",
                            fontSize: 14,
                            textAlign:
                              col.type === "number" || col.type === "currency"
                                ? "right"
                                : "left",
                          }}
                        >
                          {renderCellValue(col, row[col.key])}
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {/* Summary */}
            {reportResult.summary &&
              Object.keys(reportResult.summary).length > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "2px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 24, flexWrap: "wrap" }}
                  >
                    {Object.entries(reportResult.summary).map(
                      ([key, val]: [string, unknown]) => (
                        <div key={key}>
                          <span style={{ fontSize: 12, color: "#64748b" }}>
                            {key}:{" "}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>
                            {String(val)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
