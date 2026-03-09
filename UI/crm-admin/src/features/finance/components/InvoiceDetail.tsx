"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  Button,
  Input,
  Modal,
  Badge,
  Typography,
  CurrencyInput,
  DatePicker,
} from "@/components/ui";
import { LookupSelect } from "@/components/common/LookupSelect";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/format-date";

import {
  useInvoiceDetail,
  useSendInvoice,
  useCancelInvoice,
  useRecordPayment,
  useCreateCreditNote,
} from "../hooks/useFinance";

import type {
  InvoiceDetail as InvoiceDetailType,
  InvoiceLineItem,
  InvoiceStatus,
  PaymentItem,
  CreditNote,
  PaymentMethod,
} from "../types/finance.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const statusVariantMap: Record<InvoiceStatus, string> = {
  DRAFT: "secondary",
  SENT: "primary",
  PARTIALLY_PAID: "warning",
  PAID: "success",
  OVERDUE: "danger",
  CANCELLED: "danger",
  VOID: "outline",
};

const paymentStatusVariantMap: Record<string, string> = {
  PENDING: "warning",
  AUTHORIZED: "primary",
  CAPTURED: "primary",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "outline",
  PARTIALLY_REFUNDED: "warning",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  `\u20B9${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InvoiceDetailProps {
  invoiceId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const router = useRouter();

  const { data, isLoading } = useInvoiceDetail(invoiceId);
  const sendInvoice = useSendInvoice();
  const cancelInvoice = useCancelInvoice();
  const recordPayment = useRecordPayment();
  const createCreditNote = useCreateCreditNote();

  const invoice = data?.data as InvoiceDetailType | undefined;

  // -- Record Payment Modal state --
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [transactionRef, setTransactionRef] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [chequeBankName, setChequeBankName] = useState("");
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // -- Cancel Modal state --
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // -- Credit Note Modal state --
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [creditNoteAmount, setCreditNoteAmount] = useState<number | null>(null);
  const [creditNoteReason, setCreditNoteReason] = useState("");

  // -- Handlers --

  const handleSend = useCallback(async () => {
    try {
      await sendInvoice.mutateAsync(invoiceId);
      toast.success("Invoice sent successfully");
    } catch {
      toast.error("Failed to send invoice");
    }
  }, [invoiceId, sendInvoice]);

  const handleRecordPayment = useCallback(async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await recordPayment.mutateAsync({
        invoiceId,
        amount: paymentAmount!,
        method: paymentMethod,
        transactionRef: transactionRef || undefined,
        chequeNumber: chequeNumber || undefined,
        chequeDate: chequeDate || undefined,
        chequeBankName: chequeBankName || undefined,
        upiTransactionId: upiTransactionId || undefined,
        notes: paymentNotes || undefined,
      });
      toast.success("Payment recorded successfully");
      setShowPaymentModal(false);
      setPaymentAmount(null);
      setPaymentMethod("CASH");
      setTransactionRef("");
      setChequeNumber("");
      setChequeDate("");
      setChequeBankName("");
      setUpiTransactionId("");
      setPaymentNotes("");
    } catch {
      toast.error("Failed to record payment");
    }
  }, [
    invoiceId,
    paymentAmount,
    paymentMethod,
    transactionRef,
    chequeNumber,
    chequeDate,
    chequeBankName,
    upiTransactionId,
    paymentNotes,
    recordPayment,
  ]);

  const handleCancel = useCallback(async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    try {
      await cancelInvoice.mutateAsync({
        id: invoiceId,
        data: { reason: cancelReason.trim() },
      });
      toast.success("Invoice cancelled");
      setShowCancelModal(false);
      setCancelReason("");
    } catch {
      toast.error("Failed to cancel invoice");
    }
  }, [invoiceId, cancelReason, cancelInvoice]);

  const handleCreateCreditNote = useCallback(async () => {
    if (!creditNoteAmount || creditNoteAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!creditNoteReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      await createCreditNote.mutateAsync({
        invoiceId,
        amount: creditNoteAmount!,
        reason: creditNoteReason.trim(),
      });
      toast.success("Credit note created successfully");
      setShowCreditNoteModal(false);
      setCreditNoteAmount(null);
      setCreditNoteReason("");
    } catch {
      toast.error("Failed to create credit note");
    }
  }, [invoiceId, creditNoteAmount, creditNoteReason, createCreditNote]);

  // -- Loading / Not found --

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!invoice) {
    return (
      <div className="p-6">
        <EmptyState
          icon="file-text"
          title="Invoice not found"
          description="The invoice you're looking for doesn't exist."
          action={{
            label: "Back to Invoices",
            onClick: () => router.push("/finance/invoices"),
          }}
        />
      </div>
    );
  }

  // -- Derived values --

  const lineItems: InvoiceLineItem[] = invoice.lineItems ?? [];
  const payments: PaymentItem[] = invoice.payments ?? [];
  const creditNotes: CreditNote[] = invoice.creditNotes ?? [];

  const hasNotes =
    invoice.notes || invoice.termsAndConditions || invoice.internalNotes;

  // -- Render --

  return (
    <div className="p-6">
      {/* Page Header */}
      <PageHeader
        title={`Invoice ${invoice.invoiceNo}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        }
      />

      {/* Status bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <StatusBadge status={invoice.status.toLowerCase()} />

        {invoice.status === "DRAFT" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSend}
              loading={sendInvoice.isPending}
            >
              Send
            </Button>
            <Link href={`/finance/invoices/${invoiceId}/edit`}>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </Link>
          </>
        )}

        {(invoice.status === "SENT" ||
          invoice.status === "PARTIALLY_PAID" ||
          invoice.status === "OVERDUE") && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowPaymentModal(true)}
          >
            Record Payment
          </Button>
        )}

        {invoice.status === "OVERDUE" && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Invoice Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Invoice No</dt>
                <dd className="text-sm font-medium">{invoice.invoiceNo}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Billing Name</dt>
                <dd className="text-sm">{invoice.billingName || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Contact</dt>
                <dd className="text-sm">
                  {invoice.contact
                    ? `${invoice.contact.firstName} ${invoice.contact.lastName}`
                    : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Organization</dt>
                <dd className="text-sm">
                  {invoice.organization?.name ?? "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Lead</dt>
                <dd className="text-sm font-medium">
                  {invoice.lead?.leadNumber ?? "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Invoice Date</dt>
                <dd className="text-sm">{formatDate(invoice.invoiceDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Due Date</dt>
                <dd className="text-sm">{formatDate(invoice.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Supply Date</dt>
                <dd className="text-sm">
                  {invoice.supplyDate
                    ? formatDate(invoice.supplyDate)
                    : "\u2014"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Billing / Shipping card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Billing &amp; Shipping
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Billing */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">
                  Billing Address
                </h4>
                <dl className="space-y-1 text-sm">
                  <dd className="font-medium">{invoice.billingName}</dd>
                  {invoice.billingAddress && <dd>{invoice.billingAddress}</dd>}
                  <dd>
                    {[invoice.billingCity, invoice.billingState]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                  {invoice.billingPincode && <dd>{invoice.billingPincode}</dd>}
                  {invoice.billingGstNumber && (
                    <dd className="text-xs text-gray-400">
                      GST: {invoice.billingGstNumber}
                    </dd>
                  )}
                </dl>
              </div>

              {/* Shipping */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">
                  Shipping Address
                </h4>
                <dl className="space-y-1 text-sm">
                  <dd className="font-medium">
                    {invoice.shippingName || "\u2014"}
                  </dd>
                  {invoice.shippingAddress && (
                    <dd>{invoice.shippingAddress}</dd>
                  )}
                  <dd>
                    {[invoice.shippingCity, invoice.shippingState]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                  {invoice.shippingPincode && (
                    <dd>{invoice.shippingPincode}</dd>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Line Items card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Line Items
            </h3>
            {lineItems.length === 0 ? (
              <p className="text-sm text-gray-400">No line items</p>
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
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Product
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Qty
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Unit
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Unit Price
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Discount
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        GST %
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Line Total
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Tax
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Total w/ Tax
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item: InvoiceLineItem) => (
                      <tr
                        key={item.id}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 500 }}>
                          {item.productName}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {item.unit || "\u2014"}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {fmt(item.unitPrice)}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {fmt(item.discountAmount)}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {item.gstRate != null ? `${item.gstRate}%` : "\u2014"}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {fmt(item.lineTotal)}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {fmt(item.taxAmount)}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right", fontWeight: 500 }}>
                          {fmt(item.totalWithTax)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payments card */}
          {payments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Payments
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
                        Payment No
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Amount
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Method
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Status
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Paid At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment: PaymentItem) => (
                      <tr
                        key={payment.id}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 500 }}>
                          {payment.paymentNo}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {fmt(payment.amount)}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <Badge
                            variant={
                              (paymentStatusVariantMap[payment.method] ??
                                "secondary") as
                                | "default"
                                | "primary"
                                | "secondary"
                                | "success"
                                | "warning"
                                | "danger"
                                | "outline"
                            }
                          >
                            {payment.method}
                          </Badge>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <StatusBadge
                            status={payment.status.toLowerCase()}
                          />
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {payment.paidAt
                            ? formatDate(payment.paidAt)
                            : "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Credit Notes card */}
          {creditNotes.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Credit Notes
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
                        CN No
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
                        Issued At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditNotes.map((cn: CreditNote) => (
                      <tr
                        key={cn.id}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 500 }}>
                          {cn.creditNoteNo}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {fmt(cn.amount)}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {cn.reason}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <Badge variant="secondary">{cn.status}</Badge>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {cn.issuedAt ? formatDate(cn.issuedAt) : "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreditNoteModal(true)}
                >
                  Create Credit Note
                </Button>
              </div>
            </div>
          )}

          {/* Notes card */}
          {hasNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Notes
              </h3>
              <dl className="space-y-3">
                {invoice.notes && (
                  <div>
                    <dt className="text-xs text-gray-400">Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {invoice.notes}
                      </pre>
                    </dd>
                  </div>
                )}
                {invoice.termsAndConditions && (
                  <div>
                    <dt className="text-xs text-gray-400">
                      Terms &amp; Conditions
                    </dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {invoice.termsAndConditions}
                      </pre>
                    </dd>
                  </div>
                )}
                {invoice.internalNotes && (
                  <div>
                    <dt className="text-xs text-gray-400">Internal Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {invoice.internalNotes}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Financial Summary
            </h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd className="font-medium">{fmt(invoice.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Discount</dt>
                <dd className="text-red-500">-{fmt(invoice.discountAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Taxable Amount</dt>
                <dd className="font-medium">{fmt(invoice.taxableAmount)}</dd>
              </div>
              {!invoice.isInterState ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">CGST</dt>
                    <dd>{fmt(invoice.cgstAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">SGST</dt>
                    <dd>{fmt(invoice.sgstAmount)}</dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-gray-500">IGST</dt>
                  <dd>{fmt(invoice.igstAmount)}</dd>
                </div>
              )}
              {(invoice.cessAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cess</dt>
                  <dd>{fmt(invoice.cessAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Round Off</dt>
                <dd>{fmt(invoice.roundOff)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                <dt>
                  <Typography variant="heading" level={4}>
                    Total
                  </Typography>
                </dt>
                <dd>
                  <Typography variant="heading" level={4}>
                    {fmt(invoice.totalAmount)}
                  </Typography>
                </dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                <dt className="text-gray-500">Paid</dt>
                <dd className="font-medium">{fmt(invoice.paidAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>
                  <Typography variant="heading" level={4}>
                    Balance
                  </Typography>
                </dt>
                <dd>
                  <Typography variant="heading" level={4}>
                    {fmt(invoice.balanceAmount)}
                  </Typography>
                </dd>
              </div>
            </dl>
          </div>

          {/* Dates card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Dates
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Invoice Date</dt>
                <dd>{formatDate(invoice.invoiceDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Due Date</dt>
                <dd>{formatDate(invoice.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Supply Date</dt>
                <dd>
                  {invoice.supplyDate
                    ? formatDate(invoice.supplyDate)
                    : "\u2014"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created At</dt>
                <dd>{formatDate(invoice.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated At</dt>
                <dd>{formatDate(invoice.updatedAt)}</dd>
              </div>
              {invoice.createdBy && (
                <div>
                  <dt className="text-xs text-gray-400">Created By</dt>
                  <dd>
                    {invoice.createdBy.firstName} {invoice.createdBy.lastName}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* ── Record Payment Modal ── */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRecordPayment}
              loading={recordPayment.isPending}
            >
              Submit
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <CurrencyInput
            label="Amount"
            currency="\u20B9"
            value={paymentAmount}
            onChange={(value: number | null) => setPaymentAmount(value)}
          />
          <LookupSelect
            masterCode="PAYMENT_METHOD"
            label="Payment Method"
            value={paymentMethod}
            onChange={(v) =>
              setPaymentMethod(String(v ?? "CASH") as PaymentMethod)
            }
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Transaction Reference
            </label>
            <Input
              value={transactionRef}
              onChange={(value: string) => setTransactionRef(value)}
              placeholder="Transaction reference number"
            />
          </div>

          {paymentMethod === "CHEQUE" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cheque Number
                </label>
                <Input
                  value={chequeNumber}
                  onChange={(value: string) => setChequeNumber(value)}
                  placeholder="Cheque number"
                />
              </div>
              <DatePicker
                label="Cheque Date"
                value={chequeDate}
                onChange={(v) => setChequeDate(v)}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cheque Bank Name
                </label>
                <Input
                  value={chequeBankName}
                  onChange={(value: string) => setChequeBankName(value)}
                  placeholder="Bank name"
                />
              </div>
            </>
          )}

          {paymentMethod === "UPI" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                UPI Transaction ID
              </label>
              <Input
                value={upiTransactionId}
                onChange={(value: string) => setUpiTransactionId(value)}
                placeholder="UPI transaction ID"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={3}
              placeholder="Optional payment notes"
            />
          </div>
        </div>
      </Modal>

      {/* ── Cancel Modal ── */}
      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Invoice"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              loading={cancelInvoice.isPending}
              disabled={!cancelReason.trim()}
            >
              Submit
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Why is this invoice being cancelled?"
            />
          </div>
        </div>
      </Modal>

      {/* ── Credit Note Modal ── */}
      <Modal
        open={showCreditNoteModal}
        onClose={() => setShowCreditNoteModal(false)}
        title="Create Credit Note"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreditNoteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateCreditNote}
              loading={createCreditNote.isPending}
              disabled={!creditNoteReason.trim() || !creditNoteAmount}
            >
              Submit
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <CurrencyInput
            label="Amount"
            currency="\u20B9"
            value={creditNoteAmount}
            onChange={(value: number | null) => setCreditNoteAmount(value)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
              value={creditNoteReason}
              onChange={(e) => setCreditNoteReason(e.target.value)}
              rows={3}
              placeholder="Reason for the credit note"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
