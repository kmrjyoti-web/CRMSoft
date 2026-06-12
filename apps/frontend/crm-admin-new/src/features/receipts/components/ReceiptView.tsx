"use client";

import { useMemo } from "react";

import { Button, Card, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useReceipt } from "../hooks/useReceipts";
import type { Receipt } from "../types/receipts.types";
import { formatCurrency } from "@/lib/format-currency";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReceiptViewProps {
  receiptId: string;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReceiptView({ receiptId, onClose }: ReceiptViewProps) {
  const { data, isLoading } = useReceipt(receiptId);

  const receipt: Receipt | null = useMemo(() => {
    const raw = data?.data ?? data ?? null;
    return raw as Receipt | null;
  }, [data]);

  if (isLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
        Receipt not found.
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "600px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
          Receipt {receipt.receiptNumber}
        </h2>
        <Button variant="ghost" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      {/* Receipt Details */}
      <Card>
        <div style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "14px" }}>
            {/* Receipt Number */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Receipt Number</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{receipt.receiptNumber}</p>
            </div>

            {/* Amount */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Amount</p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "18px", color: "#059669" }}>
                {formatCurrency(receipt.amount, receipt.currency)}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Payment Method</p>
              <Badge variant="secondary">{receipt.paymentMethod}</Badge>
            </div>

            {/* Invoice */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Invoice Number</p>
              <p style={{ margin: 0 }}>{receipt.invoiceNumber || "\u2014"}</p>
            </div>

            {/* Contact */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Contact</p>
              <p style={{ margin: 0 }}>{receipt.contactName || "\u2014"}</p>
            </div>

            {/* Organization */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Organization</p>
              <p style={{ margin: 0 }}>{receipt.organizationName || "\u2014"}</p>
            </div>

            {/* Payment Date */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Payment Date</p>
              <p style={{ margin: 0 }}>{new Date(receipt.paymentDate).toLocaleDateString("en-IN")}</p>
            </div>

            {/* Receipt Date */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Receipt Date</p>
              <p style={{ margin: 0 }}>{new Date(receipt.receiptDate).toLocaleDateString("en-IN")}</p>
            </div>

            {/* Created At */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Created At</p>
              <p style={{ margin: 0 }}>{new Date(receipt.createdAt).toLocaleDateString("en-IN")}</p>
            </div>

            {/* Currency */}
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Currency</p>
              <p style={{ margin: 0 }}>{receipt.currency}</p>
            </div>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div style={{ marginTop: "16px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
              <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "12px" }}>Notes</p>
              <p style={{ margin: 0, fontSize: "14px" }}>{receipt.notes}</p>
            </div>
          )}

          {/* Download Button */}
          {receipt.downloadUrl && (
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <a href={receipt.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <Button variant="primary">
                  <Icon name="download" size={16} /> Download Receipt
                </Button>
              </a>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
