"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import {
  Card,
  Badge,
  Button,
  Input,
  Icon,
} from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";

import { useGSTDetail, useFileGST } from "../hooks/useAccounts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(amount: number | null | undefined): string {
  if (amount == null) return "\u20B90.00";
  return `\u20B9${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const STATUS_VARIANT: Record<string, string> = {
  FILED: "success",
  PENDING: "warning",
  OVERDUE: "danger",
  DRAFT: "secondary",
};

// ---------------------------------------------------------------------------
// JSON Data Table (for B2B / B2C / HSN / ITC sections)
// ---------------------------------------------------------------------------

function JsonDataTable({ title, data }: { title: string; data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
          {title}
        </h4>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>No data available</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
        {title}
      </h4>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "8px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#475569",
                    textAlign: "left",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, ri: number) => (
              <tr key={ri} style={{ borderBottom: "1px solid #f1f5f9" }}>
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: "6px 12px",
                      fontSize: 13,
                      color: "#334155",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {typeof row[col] === "number"
                      ? formatINR(row[col])
                      : String(row[col] ?? "\u2014")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tax Summary
// ---------------------------------------------------------------------------

function TaxSummary({
  outputCGST,
  outputSGST,
  outputIGST,
  outputCess,
  netTaxPayable,
}: {
  outputCGST: number;
  outputSGST: number;
  outputIGST: number;
  outputCess: number;
  netTaxPayable: number;
}) {
  const items = [
    { label: "Output CGST", value: outputCGST },
    { label: "Output SGST", value: outputSGST },
    { label: "Output IGST", value: outputIGST },
    { label: "Output Cess", value: outputCess },
  ];

  return (
    <Card>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Icon name="receipt" size={18} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
            Tax Summary
          </h3>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {items.map((item) => (
              <tr key={item.label} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 12px", fontSize: 13, color: "#475569" }}>
                  {item.label}
                </td>
                <td style={{ padding: "8px 12px", fontSize: 13, color: "#334155", textAlign: "right" }}>
                  {formatINR(item.value)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid #e2e8f0" }}>
              <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                Net Tax Payable
              </td>
              <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 700, color: "#1e293b", textAlign: "right" }}>
                {formatINR(netTaxPayable)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Props & Main Component
// ---------------------------------------------------------------------------

interface GSTReturnDetailProps {
  id: string;
}

export function GSTReturnDetail({ id }: GSTReturnDetailProps) {
  const { data, isLoading } = useGSTDetail(id);
  const fileGST = useFileGST();
  const [acknowledgementNo, setAcknowledgementNo] = useState("");

  const detail = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? null;
    return raw;
  }, [data]);

  const handleMarkAsFiled = () => {
    if (!acknowledgementNo.trim()) {
      toast.error("Acknowledgement number is required");
      return;
    }

    fileGST.mutate(
      { id, acknowledgementNo: acknowledgementNo.trim() },
      {
        onSuccess: () => {
          toast.success("GST return marked as filed");
          setAcknowledgementNo("");
        },
        onError: () => {
          toast.error("Failed to mark as filed");
        },
      },
    );
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!detail) {
    return (
      <EmptyState
        icon="file-x"
        title="GST Return Not Found"
        description="The requested GST return could not be loaded."
      />
    );
  }

  const isFiled = detail.status === "FILED";
  const isGSTR1 = detail.returnType === "GSTR-1";
  const isGSTR3B = detail.returnType === "GSTR-3B";

  return (
    <div>
      <PageHeader
        title={`GST Return - ${detail.returnType}`}
        subtitle={`${detail.period} | FY ${detail.financialYear}`}
      />

      {/* Header info */}
      <Card>
        <div style={{ padding: 20, display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Return Type</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              {detail.returnType}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Period</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              {detail.period}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Financial Year</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              {detail.financialYear}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Status</p>
            <Badge variant={(STATUS_VARIANT[detail.status] ?? "secondary") as any}>
              {detail.status}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Tax Summary */}
      <div style={{ marginTop: 20 }}>
        <TaxSummary
          outputCGST={detail.outputCGST ?? 0}
          outputSGST={detail.outputSGST ?? 0}
          outputIGST={detail.outputIGST ?? 0}
          outputCess={detail.outputCess ?? 0}
          netTaxPayable={detail.netTaxPayable ?? 0}
        />
      </div>

      {/* GSTR-1 specific sections */}
      {isGSTR1 && (
        <Card>
          <div style={{ padding: 20, marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Icon name="file-text" size={18} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                GSTR-1 Data
              </h3>
            </div>

            <JsonDataTable title="B2B Supplies" data={detail.b2bData ?? []} />
            <JsonDataTable title="B2C Supplies" data={detail.b2cData ?? []} />
            <JsonDataTable title="HSN Summary" data={detail.hsnData ?? []} />
          </div>
        </Card>
      )}

      {/* GSTR-3B specific sections */}
      {isGSTR3B && (
        <Card>
          <div style={{ padding: 20, marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Icon name="file-text" size={18} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                GSTR-3B Data
              </h3>
            </div>

            <JsonDataTable title="Input Tax Credit (ITC)" data={detail.itcData ?? []} />
            <JsonDataTable title="Output Tax" data={detail.outputTaxData ?? []} />

            {detail.netPayable != null && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                  Net Payable
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                  {formatINR(detail.netPayable)}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Mark as Filed action */}
      {!isFiled && (
        <Card>
          <div style={{ padding: 20, marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Icon name="check-square" size={18} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                Mark as Filed
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <Input
                  label="Acknowledgement Number"
                  value={acknowledgementNo}
                  onChange={(v) => setAcknowledgementNo(v)}
                  leftIcon={<Icon name="hash" size={16} />}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleMarkAsFiled}
                disabled={fileGST.isPending}
              >
                <Icon name="check" size={16} />
                {fileGST.isPending ? "Filing..." : "Mark as Filed"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
