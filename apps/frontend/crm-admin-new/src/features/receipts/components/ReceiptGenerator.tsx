"use client";

import { useState } from "react";

import toast from "react-hot-toast";

import { Button, Card, Icon, Badge } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useGenerateReceipt } from "../hooks/useReceipts";
import type { Receipt } from "../types/receipts.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReceiptGeneratorProps {
  paymentId: string;
  onGenerated?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReceiptGenerator({ paymentId, onGenerated }: ReceiptGeneratorProps) {
  const generateMut = useGenerateReceipt();
  const [generatedReceipt, setGeneratedReceipt] = useState<Receipt | null>(null);

  function handleGenerate() {
    generateMut.mutate(paymentId, {
      onSuccess: (data) => {
        const receipt = (data?.data ?? data) as Receipt | null;
        setGeneratedReceipt(receipt);
        toast.success("Receipt generated successfully");
        onGenerated?.();
      },
      onError: () => toast.error("Failed to generate receipt"),
    });
  }

  // ── Success State ───────────────────────────────────────
  if (generatedReceipt) {
    return (
      <div style={{ padding: "24px", maxWidth: "400px" }}>
        <Card>
          <div style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ marginBottom: "16px" }}>
              <Icon name="check-circle" size={48} />
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 600, color: "#059669" }}>
              Receipt Generated
            </h3>
            <p style={{ margin: "0 0 16px 0", color: "#6b7280", fontSize: "14px" }}>
              Receipt number:{" "}
              <Badge variant="primary">{generatedReceipt.receiptNumber}</Badge>
            </p>
            {generatedReceipt.downloadUrl && (
              <a href={generatedReceipt.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <Button variant="primary">
                  <Icon name="download" size={16} /> Download
                </Button>
              </a>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ── Confirmation State ──────────────────────────────────
  return (
    <div style={{ padding: "24px", maxWidth: "400px" }}>
      <Card>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ marginBottom: "16px", color: "#6b7280" }}>
            <Icon name="receipt" size={48} />
          </div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 600 }}>
            Generate Receipt
          </h3>
          <p style={{ margin: "0 0 20px 0", color: "#6b7280", fontSize: "14px" }}>
            Generate receipt for payment <strong>#{paymentId}</strong>?
          </p>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={generateMut.isPending}
          >
            {generateMut.isPending ? (
              <>
                <LoadingSpinner /> Generating...
              </>
            ) : (
              <>
                <Icon name="file-plus" size={16} /> Generate Receipt
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
