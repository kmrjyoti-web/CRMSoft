"use client";

import { useState, useMemo } from "react";

import { Button, Card, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useReceipts } from "../hooks/useReceipts";
import type { Receipt } from "../types/receipts.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReceiptListProps {
  onView?: (receipt: Receipt) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number | null | undefined, currency?: string): string {
  if (amount == null) return "\u2014";
  const sym = currency === "USD" ? "$" : "\u20B9";
  return `${sym}${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReceiptList({ onView }: ReceiptListProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useReceipts({ search: search || undefined });

  const receipts: Receipt[] = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  if (isLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Receipts</h2>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search receipts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "320px",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Receipt #</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Invoice #</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Contact</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Amount</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Payment Method</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                    No receipts found
                  </td>
                </tr>
              )}
              {receipts.map((receipt) => (
                <tr key={receipt.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{receipt.receiptNumber}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                    {receipt.invoiceNumber || "\u2014"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {receipt.contactName || receipt.organizationName || "\u2014"}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                    {formatCurrency(receipt.amount, receipt.currency)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="secondary">{receipt.paymentMethod}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                    {new Date(receipt.receiptDate).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Button variant="ghost" onClick={() => onView?.(receipt)}>
                      <Icon name="eye" size={16} /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
