"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  Button,
  Modal,
  Typography,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/format-date";

import {
  useProformaDetail,
  useSendProforma,
  useConvertToInvoice,
  useCancelProforma,
} from "../hooks/useProforma";

import type {
  ProformaDetail as ProformaDetailType,
  ProformaLineItem,
  ProformaInvoiceStatus,
} from "../types/proforma.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const statusVariantMap: Record<ProformaInvoiceStatus, string> = {
  PI_DRAFT: "secondary",
  PI_SENT: "primary",
  PI_ACCEPTED: "success",
  PI_REJECTED: "danger",
  PI_CONVERTED: "outline",
  PI_CANCELLED: "danger",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  `\u20B9${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProformaDetailProps {
  proformaId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProformaDetail({ proformaId }: ProformaDetailProps) {
  const router = useRouter();

  const { data, isLoading } = useProformaDetail(proformaId);
  const sendProforma = useSendProforma();
  const convertToInvoice = useConvertToInvoice();
  const cancelProforma = useCancelProforma();

  const proforma = data?.data as ProformaDetailType | undefined;

  // -- Cancel Modal state --
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // -- Convert confirmation --
  const [showConvertModal, setShowConvertModal] = useState(false);

  // -- Handlers --

  const handleSend = useCallback(async () => {
    try {
      await sendProforma.mutateAsync(proformaId);
      toast.success("Proforma invoice sent successfully");
    } catch {
      toast.error("Failed to send proforma invoice");
    }
  }, [proformaId, sendProforma]);

  const handleConvert = useCallback(async () => {
    try {
      await convertToInvoice.mutateAsync(proformaId);
      toast.success("Invoice created from proforma");
      setShowConvertModal(false);
    } catch {
      toast.error("Failed to convert to invoice");
    }
  }, [proformaId, convertToInvoice]);

  const handleCancel = useCallback(async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    try {
      await cancelProforma.mutateAsync({
        id: proformaId,
        data: { reason: cancelReason.trim() },
      });
      toast.success("Proforma invoice cancelled");
      setShowCancelModal(false);
      setCancelReason("");
    } catch {
      toast.error("Failed to cancel proforma invoice");
    }
  }, [proformaId, cancelReason, cancelProforma]);

  // -- Loading / Not found --

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!proforma) {
    return (
      <div className="p-6">
        <EmptyState
          icon="file-text"
          title="Proforma Invoice not found"
          description="The proforma invoice you're looking for doesn't exist."
          action={{
            label: "Back to Proforma Invoices",
            onClick: () => router.push("/finance/proforma-invoices"),
          }}
        />
      </div>
    );
  }

  // -- Derived values --

  const lineItems: ProformaLineItem[] = proforma.lineItems ?? [];

  const hasNotes =
    proforma.notes || proforma.termsAndConditions || proforma.internalNotes;

  // -- Render --

  return (
    <div className="p-6">
      {/* Page Header */}
      <PageHeader
        title={`Proforma ${proforma.proformaNo}`}
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
        <StatusBadge status={proforma.status.replace("PI_", "").toLowerCase()} />

        {proforma.status === "PI_DRAFT" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSend}
              loading={sendProforma.isPending}
            >
              Send
            </Button>
            <Link href={`/finance/proforma-invoices/${proformaId}/edit`}>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </Link>
          </>
        )}

        {(proforma.status === "PI_SENT" || proforma.status === "PI_ACCEPTED") && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowConvertModal(true)}
          >
            Convert to Invoice
          </Button>
        )}

        {(proforma.status === "PI_DRAFT" ||
          proforma.status === "PI_SENT" ||
          proforma.status === "PI_REJECTED") && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel
          </Button>
        )}

        {proforma.status === "PI_CONVERTED" && proforma.invoiceId && (
          <Link href={`/finance/invoices/${proforma.invoiceId}`}>
            <Button size="sm" variant="outline">
              View Invoice
            </Button>
          </Link>
        )}
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proforma Details card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Proforma Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Proforma No</dt>
                <dd className="text-sm font-medium">{proforma.proformaNo}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Billing Name</dt>
                <dd className="text-sm">{proforma.billingName || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Proforma Date</dt>
                <dd className="text-sm">{formatDate(proforma.proformaDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Valid Until</dt>
                <dd className="text-sm">
                  {proforma.validUntil
                    ? formatDate(proforma.validUntil)
                    : "\u2014"}
                </dd>
              </div>
              {proforma.quotationId && (
                <div>
                  <dt className="text-xs text-gray-400">Quotation ID</dt>
                  <dd className="text-sm font-medium">{proforma.quotationId}</dd>
                </div>
              )}
              {proforma.leadId && (
                <div>
                  <dt className="text-xs text-gray-400">Lead ID</dt>
                  <dd className="text-sm font-medium">{proforma.leadId}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Billing Address card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Billing Address
            </h3>
            <dl className="space-y-1 text-sm">
              <dd className="font-medium">{proforma.billingName}</dd>
              {proforma.billingAddress && <dd>{proforma.billingAddress}</dd>}
              <dd>
                {[proforma.billingCity, proforma.billingState]
                  .filter(Boolean)
                  .join(", ")}
              </dd>
              {proforma.billingPincode && <dd>{proforma.billingPincode}</dd>}
              {proforma.billingGstNumber && (
                <dd className="text-xs text-gray-400">
                  GST: {proforma.billingGstNumber}
                </dd>
              )}
            </dl>
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
                    {lineItems.map((item: ProformaLineItem) => (
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

          {/* Notes card */}
          {hasNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Notes
              </h3>
              <dl className="space-y-3">
                {proforma.notes && (
                  <div>
                    <dt className="text-xs text-gray-400">Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {proforma.notes}
                      </pre>
                    </dd>
                  </div>
                )}
                {proforma.termsAndConditions && (
                  <div>
                    <dt className="text-xs text-gray-400">
                      Terms &amp; Conditions
                    </dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {proforma.termsAndConditions}
                      </pre>
                    </dd>
                  </div>
                )}
                {proforma.internalNotes && (
                  <div>
                    <dt className="text-xs text-gray-400">Internal Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {proforma.internalNotes}
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
                <dd className="font-medium">{fmt(proforma.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Discount</dt>
                <dd className="text-red-500">-{fmt(proforma.discountAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Taxable Amount</dt>
                <dd className="font-medium">{fmt(proforma.taxableAmount)}</dd>
              </div>
              {!proforma.isInterState ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">CGST</dt>
                    <dd>{fmt(proforma.cgstAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">SGST</dt>
                    <dd>{fmt(proforma.sgstAmount)}</dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-gray-500">IGST</dt>
                  <dd>{fmt(proforma.igstAmount)}</dd>
                </div>
              )}
              {(proforma.cessAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cess</dt>
                  <dd>{fmt(proforma.cessAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Round Off</dt>
                <dd>{fmt(proforma.roundOff)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                <dt>
                  <Typography variant="heading" level={4}>
                    Total
                  </Typography>
                </dt>
                <dd>
                  <Typography variant="heading" level={4}>
                    {fmt(proforma.totalAmount)}
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
                <dt className="text-xs text-gray-400">Proforma Date</dt>
                <dd>{formatDate(proforma.proformaDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Valid Until</dt>
                <dd>
                  {proforma.validUntil
                    ? formatDate(proforma.validUntil)
                    : "\u2014"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Seller Info card */}
          {proforma.sellerName && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Seller Info
              </h3>
              <dl className="space-y-1 text-sm">
                <dd className="font-medium">{proforma.sellerName}</dd>
                {proforma.sellerAddress && <dd>{proforma.sellerAddress}</dd>}
                <dd>
                  {[proforma.sellerCity, proforma.sellerState]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
                {proforma.sellerPincode && <dd>{proforma.sellerPincode}</dd>}
                {proforma.sellerGstNumber && (
                  <dd className="text-xs text-gray-400">
                    GST: {proforma.sellerGstNumber}
                  </dd>
                )}
                {proforma.sellerPanNumber && (
                  <dd className="text-xs text-gray-400">
                    PAN: {proforma.sellerPanNumber}
                  </dd>
                )}
              </dl>
            </div>
          )}

          {/* Metadata card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created At</dt>
                <dd>{formatDate(proforma.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated At</dt>
                <dd>{formatDate(proforma.updatedAt)}</dd>
              </div>
              {proforma.cancelledAt && (
                <div>
                  <dt className="text-xs text-gray-400">Cancelled At</dt>
                  <dd>{formatDate(proforma.cancelledAt)}</dd>
                </div>
              )}
              {proforma.cancelReason && (
                <div>
                  <dt className="text-xs text-gray-400">Cancel Reason</dt>
                  <dd className="text-red-500">{proforma.cancelReason}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* ── Cancel Modal ── */}
      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Proforma Invoice"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Close
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              loading={cancelProforma.isPending}
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
              placeholder="Why is this proforma invoice being cancelled?"
            />
          </div>
        </div>
      </Modal>

      {/* ── Convert to Invoice Modal ── */}
      <Modal
        open={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        title="Convert to Invoice"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConvertModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConvert}
              loading={convertToInvoice.isPending}
            >
              Convert
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          This will create a new invoice from this proforma invoice and mark it
          as converted. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
