'use client';

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button, Icon, Badge, Modal, SelectInput, Input, Typography } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/format-date";

import {
  useQuotationDetail,
  useSendQuotation,
  useAcceptQuotation,
  useRejectQuotation,
  useReviseQuotation,
} from "../hooks/useQuotations";
import type { SendChannel, LineItem, SendLog } from "../types/quotations.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHANNEL_OPTIONS = [
  { label: "Email", value: "EMAIL" },
  { label: "WhatsApp", value: "WHATSAPP" },
  { label: "Portal", value: "PORTAL" },
  { label: "Manual", value: "MANUAL" },
  { label: "Download", value: "DOWNLOAD" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  `\u20B9${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface QuotationDetailProps {
  quotationId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuotationDetail({ quotationId }: QuotationDetailProps) {
  const router = useRouter();

  const { data, isLoading } = useQuotationDetail(quotationId);
  const sendMutation = useSendQuotation();
  const acceptMutation = useAcceptQuotation();
  const rejectMutation = useRejectQuotation();
  const reviseMutation = useReviseQuotation();

  const quotation = data?.data;

  // -- Send Modal state --
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendChannel, setSendChannel] = useState<string>("EMAIL");
  const [sendEmail, setSendEmail] = useState("");
  const [sendMessage, setSendMessage] = useState("");

  // -- Accept Modal state --
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptNote, setAcceptNote] = useState("");

  // -- Reject Modal state --
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // -- Handlers --

  const handleSend = useCallback(async () => {
    try {
      await sendMutation.mutateAsync({
        id: quotationId,
        data: {
          channel: sendChannel as SendChannel,
          receiverEmail: sendEmail || undefined,
          message: sendMessage || undefined,
        },
      });
      toast.success("Quotation sent successfully");
      setShowSendModal(false);
      setSendChannel("EMAIL");
      setSendEmail("");
      setSendMessage("");
    } catch {
      toast.error("Failed to send quotation");
    }
  }, [quotationId, sendChannel, sendEmail, sendMessage, sendMutation]);

  const handleAccept = useCallback(async () => {
    try {
      await acceptMutation.mutateAsync({
        id: quotationId,
        data: { acceptedNote: acceptNote || undefined },
      });
      toast.success("Quotation accepted");
      setShowAcceptModal(false);
      setAcceptNote("");
    } catch {
      toast.error("Failed to accept quotation");
    }
  }, [quotationId, acceptNote, acceptMutation]);

  const handleReject = useCallback(async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        id: quotationId,
        data: { rejectedReason: rejectReason.trim() },
      });
      toast.success("Quotation rejected");
      setShowRejectModal(false);
      setRejectReason("");
    } catch {
      toast.error("Failed to reject quotation");
    }
  }, [quotationId, rejectReason, rejectMutation]);

  const handleRevise = useCallback(async () => {
    try {
      const result = await reviseMutation.mutateAsync(quotationId);
      toast.success("New revision created");
      const newId = (result as { data?: { id?: string } })?.data?.id ?? quotationId;
      router.push(`/quotations/${newId}/edit`);
    } catch {
      toast.error("Failed to revise quotation");
    }
  }, [quotationId, reviseMutation, router]);

  // -- Loading / Not found --

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!quotation) {
    return (
      <div className="p-6">
        <EmptyState
          icon="file-text"
          title="Quotation not found"
          description="The quotation you're looking for doesn't exist."
          action={{
            label: "Back to Quotations",
            onClick: () => router.push("/quotations"),
          }}
        />
      </div>
    );
  }

  // -- Derived values --

  const isInterState =
    (quotation.igstAmount ?? 0) > 0 && (quotation.cgstAmount ?? 0) === 0;

  const hasTerms =
    quotation.paymentTerms ||
    quotation.deliveryTerms ||
    quotation.warrantyTerms ||
    quotation.termsConditions;

  const lineItems: LineItem[] = quotation.lineItems ?? [];
  const sendLogs: SendLog[] = quotation.sendLogs ?? [];

  // -- Render --

  return (
    <div className="p-6">
      {/* Page Header */}
      <PageHeader
        title={`Quotation ${quotation.quotationNo}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            {(quotation.status === "DRAFT" ||
              quotation.status === "INTERNAL_REVIEW") && (
              <Link href={`/quotations/${quotationId}/edit`}>
                <Button variant="outline">
                  <Icon name="edit" size={16} /> Edit
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Status bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <StatusBadge status={quotation.status.toLowerCase()} />

        {(quotation.status === "DRAFT" ||
          quotation.status === "INTERNAL_REVIEW") && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowSendModal(true)}
          >
            Send
          </Button>
        )}

        {["SENT", "VIEWED", "NEGOTIATION"].includes(quotation.status) && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowAcceptModal(true)}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setShowRejectModal(true)}
            >
              Reject
            </Button>
            <Button size="sm" variant="outline" onClick={handleRevise}>
              Revise
            </Button>
          </>
        )}

        {quotation.status === "ACCEPTED" && quotation.acceptedNote && (
          <span className="text-sm text-green-600">
            Note: {quotation.acceptedNote}
          </span>
        )}

        {quotation.status === "REJECTED" && quotation.rejectedReason && (
          <span className="text-sm text-red-600">
            Reason: {quotation.rejectedReason}
          </span>
        )}
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quotation Details card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Quotation Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Quotation No</dt>
                <dd className="text-sm font-medium">{quotation.quotationNo}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Title</dt>
                <dd className="text-sm">{quotation.title || "\u2014"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400">Summary</dt>
                <dd className="text-sm">{quotation.summary || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Price Type</dt>
                <dd>
                  <Badge variant="secondary">
                    {quotation.priceType ?? "FIXED"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Version</dt>
                <dd className="text-sm font-medium">{quotation.version}</dd>
              </div>
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
                        #
                      </th>
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
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {idx + 1}
                        </td>
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

          {/* Terms card */}
          {hasTerms && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Terms
              </h3>
              <dl className="space-y-3">
                {quotation.paymentTerms && (
                  <div>
                    <dt className="text-xs text-gray-400">Payment Terms</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {quotation.paymentTerms}
                      </pre>
                    </dd>
                  </div>
                )}
                {quotation.deliveryTerms && (
                  <div>
                    <dt className="text-xs text-gray-400">Delivery Terms</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {quotation.deliveryTerms}
                      </pre>
                    </dd>
                  </div>
                )}
                {quotation.warrantyTerms && (
                  <div>
                    <dt className="text-xs text-gray-400">Warranty Terms</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {quotation.warrantyTerms}
                      </pre>
                    </dd>
                  </div>
                )}
                {quotation.termsConditions && (
                  <div>
                    <dt className="text-xs text-gray-400">
                      Terms &amp; Conditions
                    </dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {quotation.termsConditions}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Send History card */}
          {sendLogs.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Send History
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
                        Channel
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Sent At
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Receiver
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Viewed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sendLogs.map((log) => (
                      <tr
                        key={log.id}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td style={{ padding: "10px 12px" }}>
                          <Badge variant="secondary">{log.channel}</Badge>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {formatDate(log.sentAt)}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {log.receiverEmail || log.receiverName || "\u2014"}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                          {log.viewedAt ? formatDate(log.viewedAt) : "\u2014"}
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
          {/* Summary card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Summary
            </h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd className="font-medium">{fmt(quotation.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Discount</dt>
                <dd className="text-red-500">-{fmt(quotation.discountAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Taxable</dt>
                <dd className="font-medium">{fmt(quotation.taxableAmount)}</dd>
              </div>
              {!isInterState ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">CGST</dt>
                    <dd>{fmt(quotation.cgstAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">SGST</dt>
                    <dd>{fmt(quotation.sgstAmount)}</dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-gray-500">IGST</dt>
                  <dd>{fmt(quotation.igstAmount)}</dd>
                </div>
              )}
              {(quotation.cessAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cess</dt>
                  <dd>{fmt(quotation.cessAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Round Off</dt>
                <dd>{fmt(quotation.roundOff)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                <dt>
                  <Typography variant="heading" level={4}>
                    Total
                  </Typography>
                </dt>
                <dd>
                  <Typography variant="heading" level={4}>
                    {fmt(quotation.totalAmount)}
                  </Typography>
                </dd>
              </div>
            </dl>
          </div>

          {/* Validity card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Validity
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Valid From</dt>
                <dd>
                  {quotation.validFrom
                    ? formatDate(quotation.validFrom)
                    : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Valid Until</dt>
                <dd>
                  {quotation.validUntil
                    ? formatDate(quotation.validUntil)
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
                <dd>{formatDate(quotation.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated At</dt>
                <dd>{formatDate(quotation.updatedAt)}</dd>
              </div>
              {quotation.createdBy && (
                <div>
                  <dt className="text-xs text-gray-400">Created By</dt>
                  <dd>
                    {quotation.createdBy.firstName}{" "}
                    {quotation.createdBy.lastName}
                  </dd>
                </div>
              )}
              {quotation.lead && (
                <div>
                  <dt className="text-xs text-gray-400">Lead</dt>
                  <dd className="font-medium">
                    {quotation.lead.leadNumber}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-400">Version</dt>
                <dd>{quotation.version}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* ── Send Modal ── */}
      <Modal
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Quotation"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSendModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              loading={sendMutation.isPending}
            >
              Send
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <SelectInput
            label="Channel"
            options={CHANNEL_OPTIONS}
            value={sendChannel}
            onChange={(v) => setSendChannel(String(v ?? ""))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Receiver Email
            </label>
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={sendEmail}
              onChange={(value: string) => setSendEmail(value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              rows={3}
              placeholder="Optional message to include"
            />
          </div>
        </div>
      </Modal>

      {/* ── Accept Modal ── */}
      <Modal
        open={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Accept Quotation"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAcceptModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAccept}
              loading={acceptMutation.isPending}
            >
              Accept
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Note
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
              value={acceptNote}
              onChange={(e) => setAcceptNote(e.target.value)}
              rows={3}
              placeholder="Optional acceptance note"
            />
          </div>
        </div>
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Quotation"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={rejectMutation.isPending}
              disabled={!rejectReason.trim()}
            >
              Reject
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
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Why is this quotation being rejected?"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
