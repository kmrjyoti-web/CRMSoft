"use client";

import { useRouter } from "next/navigation";

import { Card, Badge, Button } from "@/components/ui";
import { Icon } from "@/components/ui";
import {
  usePaymentDetail,
  useApprovePayment,
  useCancelPayment,
} from "../hooks/useAccounts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(value: number | string | null | undefined): string {
  if (value == null) return "\u2014";
  return `\u20B9${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  APPROVED: "success",
  DRAFT: "default",
  PENDING_APPROVAL: "warning",
  CANCELLED: "danger",
};

// ---------------------------------------------------------------------------
// Field row helper
// ---------------------------------------------------------------------------

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value || "\u2014"}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading } = usePaymentDetail(id);
  const approvePayment = useApprovePayment();
  const cancelPayment = useCancelPayment();

  if (isLoading) return <div className="p-6">Loading...</div>;

  const payment = data?.data;
  if (!payment) return <div className="p-6">Payment not found</div>;

  const canApprove =
    payment.status === "DRAFT" || payment.status === "PENDING_APPROVAL";
  const canCancel = payment.status !== "CANCELLED";

  const handleApprove = async () => {
    await approvePayment.mutateAsync({ id });
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this payment?")) return;
    await cancelPayment.mutateAsync(id);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <Icon name="arrow-left" size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {payment.paymentNumber || "Payment Detail"}
            </h1>
            <Badge variant={STATUS_VARIANT[payment.status] || "default"}>
              {payment.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canApprove && (
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={approvePayment.isPending}
            >
              <Icon name="check-circle" size={16} />
              {approvePayment.isPending ? "Approving..." : "Approve"}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={cancelPayment.isPending}
            >
              <Icon name="x-circle" size={16} />
              {cancelPayment.isPending ? "Cancelling..." : "Cancel Payment"}
            </Button>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="receipt" size={18} />
          Payment Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Payment Number" value={payment.paymentNumber} />
          <Field
            label="Payment Type"
            value={
              <Badge
                variant={
                  payment.paymentType === "RECEIPT_IN" ? "success" : "danger"
                }
              >
                {payment.paymentType === "RECEIPT_IN" ? "Receipt" : "Payment"}
              </Badge>
            }
          />
          <Field label="Payment Date" value={formatDate(payment.paymentDate)} />
          <Field label="Amount" value={formatINR(payment.amount)} />
          <Field label="Net Amount" value={formatINR(payment.netAmount)} />
          <Field label="Payment Mode" value={payment.paymentMode} />
        </div>
        {payment.narration && (
          <div className="pt-2 border-t">
            <Field label="Narration" value={payment.narration} />
          </div>
        )}
      </Card>

      {/* Entity Info */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="building" size={18} />
          Entity Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Entity Type" value={payment.entityType} />
          <Field label="Entity ID" value={payment.entityId} />
          <Field label="Entity Name" value={payment.entityName} />
        </div>
      </Card>

      {/* Bank Details */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="landmark" size={18} />
          Bank Details
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field
            label="Bank Account"
            value={payment.bankAccount?.accountName || payment.bankAccountId}
          />
          {payment.paymentMode === "CHEQUE" && (
            <>
              <Field label="Cheque Number" value={payment.chequeNumber} />
              <Field label="Cheque Date" value={formatDate(payment.chequeDate)} />
            </>
          )}
          {(payment.paymentMode === "BANK_TRANSFER" ||
            payment.paymentMode === "NEFT" ||
            payment.paymentMode === "RTGS") && (
            <Field label="Transaction Ref" value={payment.transactionRef} />
          )}
          {payment.paymentMode === "UPI" && (
            <Field label="UPI ID" value={payment.upiId} />
          )}
        </div>
      </Card>

      {/* TDS Details */}
      {payment.tdsApplicable && (
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="percent" size={18} />
            TDS Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="TDS Section" value={payment.tdsSection} />
            <Field label="TDS Rate" value={`${payment.tdsRate}%`} />
            <Field label="TDS Amount" value={formatINR(payment.tdsAmount)} />
            <Field label="Net Amount" value={formatINR(payment.netAmount)} />
          </div>
        </Card>
      )}

      {/* Timestamps */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-400">
          <Field label="Created At" value={formatDate(payment.createdAt)} />
          <Field label="Updated At" value={formatDate(payment.updatedAt)} />
          {payment.approvedAt && (
            <Field label="Approved At" value={formatDate(payment.approvedAt)} />
          )}
        </div>
      </Card>
    </div>
  );
}
