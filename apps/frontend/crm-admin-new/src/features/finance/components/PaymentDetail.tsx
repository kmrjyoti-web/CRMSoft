"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button, Modal, Badge, Typography, CurrencyInput, TextareaInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";

import { usePaymentDetail, useCreateRefund } from "../hooks/useFinance";
import type {
  PaymentDetail as PaymentDetailType,
  PaymentStatus,
  Refund,
  PaymentReceipt,
} from "../types/finance.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const statusVariantMap: Record<PaymentStatus, string> = {
  PENDING: "warning",
  AUTHORIZED: "primary",
  CAPTURED: "primary",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "outline",
  PARTIALLY_REFUNDED: "warning",
};

const refundStatusVariantMap: Record<string, string> = {
  REFUND_PENDING: "warning",
  REFUND_PROCESSED: "success",
  REFUND_FAILED: "danger",
  REFUND_CANCELLED: "outline",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  `\u20B9${Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN");

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PaymentDetailProps {
  paymentId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentDetail({ paymentId }: PaymentDetailProps) {
  const router = useRouter();

  const { data, isLoading } = usePaymentDetail(paymentId);
  const createRefund = useCreateRefund();

  const payment = data?.data as PaymentDetailType | undefined;

  // -- Refund Modal state --
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | null>(null);
  const [refundReason, setRefundReason] = useState("");

  // -- Handlers --

  const handleRefund = useCallback(async () => {
    if (!refundAmount || refundAmount <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }
    try {
      await createRefund.mutateAsync({
        paymentId,
        amount: refundAmount!,
        reason: refundReason,
      });
      toast.success("Refund initiated successfully");
      setShowRefundModal(false);
      setRefundAmount(null);
      setRefundReason("");
    } catch {
      toast.error("Failed to initiate refund");
    }
  }, [paymentId, refundAmount, refundReason, createRefund]);

  // -- Loading / Not found --

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!payment) {
    return (
      <div className="p-6">
        <EmptyState
          icon="credit-card"
          title="Payment not found"
          description="The payment you're looking for doesn't exist."
          action={{
            label: "Back to Payments",
            onClick: () => router.push("/finance/payments"),
          }}
        />
      </div>
    );
  }

  // -- Render --

  return (
    <div className="p-6">
      {/* Page Header */}
      <PageHeader
        title={`Payment ${payment.paymentNo}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        }
      />

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Info card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Payment Information
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Payment No</dt>
                <dd className="text-sm font-medium">{payment.paymentNo}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Invoice No</dt>
                <dd className="text-sm font-medium">
                  <Link
                    href={`/finance/invoices/${payment.invoiceId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {payment.invoice?.invoiceNo ?? payment.invoiceId}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Amount</dt>
                <dd className="text-sm font-medium">{fmt(payment.amount)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Currency</dt>
                <dd className="text-sm">{payment.currency}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Method</dt>
                <dd className="text-sm">{payment.method}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Gateway</dt>
                <dd className="text-sm">{payment.gateway}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Status</dt>
                <dd>
                  <StatusBadge status={payment.status.toLowerCase()} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Paid At</dt>
                <dd className="text-sm">
                  {payment.paidAt ? fmtDate(payment.paidAt) : "\u2014"}
                </dd>
              </div>

              {/* Conditional: Cheque details */}
              {payment.chequeNumber && (
                <>
                  <div>
                    <dt className="text-xs text-gray-400">Cheque Number</dt>
                    <dd className="text-sm">{payment.chequeNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Cheque Date</dt>
                    <dd className="text-sm">
                      {payment.chequeDate ? fmtDate(payment.chequeDate) : "\u2014"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Bank Name</dt>
                    <dd className="text-sm">{payment.chequeBankName ?? "\u2014"}</dd>
                  </div>
                </>
              )}

              {/* Conditional: Transaction Reference */}
              {payment.transactionRef && (
                <div>
                  <dt className="text-xs text-gray-400">Transaction Reference</dt>
                  <dd className="text-sm">{payment.transactionRef}</dd>
                </div>
              )}

              {/* Conditional: UPI Transaction ID */}
              {payment.upiTransactionId && (
                <div>
                  <dt className="text-xs text-gray-400">UPI Transaction ID</dt>
                  <dd className="text-sm">{payment.upiTransactionId}</dd>
                </div>
              )}

              {/* Conditional: Notes */}
              {payment.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400">Notes</dt>
                  <dd className="text-sm">{payment.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Receipt card */}
          {payment.receipt && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Receipt
              </h3>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-gray-400">Receipt No</dt>
                  <dd className="text-sm font-medium">
                    {payment.receipt.receiptNo}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Amount</dt>
                  <dd className="text-sm font-medium">
                    {fmt(payment.receipt.amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Received From</dt>
                  <dd className="text-sm">{payment.receipt.receivedFrom}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Paid For</dt>
                  <dd className="text-sm">{payment.receipt.paidFor}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Payment Method</dt>
                  <dd className="text-sm">{payment.receipt.paymentMethod}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Payment Date</dt>
                  <dd className="text-sm">
                    {fmtDate(payment.receipt.paymentDate)}
                  </dd>
                </div>
                {payment.receipt.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-gray-400">Notes</dt>
                    <dd className="text-sm">{payment.receipt.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Refunds card */}
          {payment.refunds && payment.refunds.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Refunds
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid #e2e8f0",
                        textAlign: "left",
                      }}
                    >
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Refund No
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Amount
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Reason
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Status
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Processed At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payment.refunds.map((refund: Refund) => (
                      <tr
                        key={refund.id}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 500 }}>
                          {refund.refundNo}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {fmt(refund.amount)}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {refund.reason}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <Badge
                            variant={
                              (refundStatusVariantMap[refund.status] ?? "default") as
                                | "default"
                                | "primary"
                                | "secondary"
                                | "success"
                                | "warning"
                                | "danger"
                                | "outline"
                            }
                          >
                            {refund.status.replace("REFUND_", "")}
                          </Badge>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {refund.processedAt
                            ? fmtDate(refund.processedAt)
                            : "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Status
            </h3>
            <div className="flex flex-col items-center gap-4">
              <StatusBadge status={payment.status.toLowerCase()} />
              {(payment.status === "PAID" || payment.status === "CAPTURED") && (
                <Button
                  variant="danger"
                  onClick={() => setShowRefundModal(true)}
                >
                  Initiate Refund
                </Button>
              )}
            </div>
          </div>

          {/* Amount card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Amount
            </h3>
            <Typography variant="heading" level={3}>
              {fmt(payment.amount)}
            </Typography>
          </div>

          {/* Metadata card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Recorded By ID</dt>
                <dd>{payment.recordedById}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Created At</dt>
                <dd>{fmtDate(payment.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated At</dt>
                <dd>{fmtDate(payment.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* -- Refund Modal -- */}
      <Modal
        open={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Initiate Refund"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRefundModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRefund}
              loading={createRefund.isPending}
              disabled={!refundAmount || !refundReason.trim()}
            >
              Initiate Refund
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <CurrencyInput
            label="Refund Amount"
            currency="\u20B9"
            value={refundAmount}
            onChange={(v: number | null) => setRefundAmount(v)}
          />
          <TextareaInput
            label="Reason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
