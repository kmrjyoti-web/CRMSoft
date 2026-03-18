"use client";

import { useState, useMemo } from "react";
import { Button, Badge, Icon, Input, SelectInput, DatePicker } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useApiLogs } from "../hooks/useApiGateway";
import type { ApiLog } from "../types/api-gateway.types";
import { formatDate } from "@/lib/format-date";

// ── Helpers ──────────────────────────────────────────────────────────────────


const METHOD_VARIANTS: Record<
  string,
  { variant: "primary" | "success" | "warning" | "danger"; bg: string }
> = {
  GET:    { variant: "primary",  bg: "#3b82f6" },
  POST:   { variant: "success",  bg: "#22c55e" },
  PUT:    { variant: "warning",  bg: "#f59e0b" },
  PATCH:  { variant: "warning",  bg: "#f59e0b" },
  DELETE: { variant: "danger",   bg: "#ef4444" },
};

function MethodBadge({ method }: { method: string }) {
  const config = METHOD_VARIANTS[method.toUpperCase()] ?? { variant: "secondary" as const, bg: "#64748b" };
  return (
    <Badge variant={config.variant} style={{ fontFamily: "monospace", fontSize: 11, minWidth: 56, textAlign: "center" }}>
      {method.toUpperCase()}
    </Badge>
  );
}

function StatusCode({ code }: { code: number }) {
  const isError = code >= 400;
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        fontWeight: 600,
        color: isError ? "#ef4444" : "#16a34a",
      }}
    >
      {code}
    </span>
  );
}

const HTTP_METHODS = [
  { label: "All Methods", value: "" },
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PUT", value: "PUT" },
  { label: "PATCH", value: "PATCH" },
  { label: "DELETE", value: "DELETE" },
];

// ── Main Component ────────────────────────────────────────────────────────────

export function ApiLogViewer() {
  const [method, setMethod] = useState("");
  const [path, setPath] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filters = useMemo(
    () => ({
      ...(method && { method }),
      ...(path.trim() && { path: path.trim() }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    }),
    [method, path, fromDate, toDate]
  );

  const { data, isLoading, refetch } = useApiLogs(filters);

  const logs = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]) as ApiLog[];

  const handleClear = () => {
    setMethod("");
    setPath("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          API Logs
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          View and filter API request logs
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 16,
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: 140 }}>
          <SelectInput
            label="Method"
            leftIcon={<Icon name="filter" size={15} />}
            options={HTTP_METHODS}
            value={method}
            onChange={(v) => setMethod(String(v ?? ""))}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input
            label="Path contains"
            leftIcon={<Icon name="search" size={15} />}
            value={path}
            onChange={setPath}
          />
        </div>
        <div style={{ width: 170 }}>
          <DatePicker label="From Date" value={fromDate} onChange={(v) => setFromDate(v)} />
        </div>
        <div style={{ width: 170 }}>
          <DatePicker label="To Date" value={toDate} onChange={(v) => setToDate(v)} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="primary" onClick={() => refetch()}>
            <Icon name="search" size={15} />
            Search
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <Icon name="x" size={15} />
            Clear
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 13, color: "#64748b" }}>
          {isLoading ? "Loading..." : `${logs.length} log${logs.length !== 1 ? "s" : ""} found`}
        </p>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <Icon name="refresh" size={14} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Method", "Path", "Status", "Duration", "API Key", "IP Address", "Timestamp"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid #e2e8f0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}
                  >
                    No logs match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 14px" }}>
                      <MethodBadge method={log.method} />
                    </td>
                    <td style={{ padding: "10px 14px", maxWidth: 300 }}>
                      <code
                        style={{
                          fontFamily: "monospace",
                          fontSize: 13,
                          color: "#475569",
                          wordBreak: "break-all",
                        }}
                      >
                        {log.path}
                      </code>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <StatusCode code={log.statusCode} />
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>
                      {log.duration}ms
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "#64748b" }}>
                      {log.apiKeyName ?? log.apiKeyId ?? "—"}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>
                      {log.ipAddress}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
