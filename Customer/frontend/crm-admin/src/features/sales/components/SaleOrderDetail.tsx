"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button, Icon, Badge, Card } from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/format-date";

import {
  useSaleOrderDetail,
  useApproveSaleOrder,
  useRejectSaleOrder,
  useConvertToInvoice,
  useCancelSaleOrder,
} from "../hooks/useSales";
import type { SaleOrder, SaleOrderItem, DeliveryChallan } from "../types/sales.types";

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_COLOR_MAP: Record<string, "default" | "warning" | "primary" | "success" | "danger"> = {
  DRAFT: "default",
  PENDING_APPROVAL: "warning",
  CONFIRMED: "primary",
  PARTIALLY_DELIVERED: "warning",
  FULLY_DELIVERED: "success",
  INVOICED: "success",
  CANCELLED: "danger",
};

const CHALLAN_STATUS_COLOR: Record<string, "default" | "warning" | "primary" | "success" | "danger"> = {
  DRAFT: "default",
  DISPATCHED: "warning",
  IN_TRANSIT: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const fmt = (n: number | null | undefined) =>
  `\u20B9${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SaleOrderDetailProps {
  id: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SaleOrderDetail({ id }: SaleOrderDetailProps) {
  const router = useRouter();

  const { data, isLoading } = useSaleOrderDetail(id);
  const approveMutation = useApproveSaleOrder();
  const rejectMutation = useRejectSaleOrder();
  const convertMutation = useConvertToInvoice();
  const cancelMutation = useCancelSaleOrder();

  const order: SaleOrder | undefined = data?.data;

  // -- Action handlers --------------------------------------------------------

  const handleApprove = useCallback(async () => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Sale order approved");
    } catch {
      toast.error("Failed to approve sale order");
    }
  }, [id, approveMutation]);

  const handleReject = useCallback(async () => {
    try {
      await rejectMutation.mutateAsync({ id });
      toast.success("Sale order rejected");
    } catch {
      toast.error("Failed to reject sale order");
    }
  }, [id, rejectMutation]);

  const handleConvertToInvoice = useCallback(async () => {
    try {
      await convertMutation.mutateAsync(id);
      toast.success("Invoice created from sale order");
    } catch {
      toast.error("Failed to convert to invoice");
    }
  }, [id, convertMutation]);

  const handleCancel = useCallback(async () => {
    try {
      await cancelMutation.mutateAsync(id);
      toast.success("Sale order cancelled");
    } catch {
      toast.error("Failed to cancel sale order");
    }
  }, [id, cancelMutation]);

  // -- Loading / Not found ----------------------------------------------------

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!order) {
    return (
      <div className="p-6">
        <EmptyState
          icon="file-text"
          title="Sale order not found"
          description="The sale order you are looking for does not exist."
          action={{
            label: "Back to Sale Orders",
            onClick: () => router.push("/sales/orders"),
          }}
        />
      </div>
    );
  }

  // -- Derived ----------------------------------------------------------------

  const items: SaleOrderItem[] = order.items ?? [];
  const challans: DeliveryChallan[] = order.deliveryChallans ?? [];
  const statusVariant = STATUS_COLOR_MAP[order.status] ?? "default";
  const statusLabel = order.status.replace(/_/g, " ");
  const completionPct = order.completionPercent ?? 0;
  const hasDeliveries = challans.length > 0;

  const canApproveReject = order.status === "DRAFT" || order.status === "PENDING_APPROVAL";
  const canCreateChallan = order.status === "CONFIRMED";
  const canConvertInvoice = order.status === "CONFIRMED";
  const canCancel =
    order.status !== "CANCELLED" &&
    order.status !== "INVOICED" &&
    !hasDeliveries;

  // -- Render -----------------------------------------------------------------

  return (
    <div className="p-6">
      {/* Page Header */}
      <PageHeader
        title={`Sale Order ${order.orderNumber}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        }
      />

      {/* Status + Actions bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <Badge variant={statusVariant}>{statusLabel}</Badge>

        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">
          Order Date: <span className="font-medium">{formatDate(order.orderDate)}</span>
        </span>

        {order.expectedDeliveryDate && (
          <>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-500">
              Expected Delivery:{" "}
              <span className="font-medium">{formatDate(order.expectedDeliveryDate)}</span>
            </span>
          </>
        )}

        <div className="ml-auto flex gap-2">
          {canApproveReject && (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={handleApprove}
                loading={approveMutation.isPending}
              >
                <Icon name="check" size={14} /> Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleReject}
                loading={rejectMutation.isPending}
              >
                <Icon name="x" size={14} /> Reject
              </Button>
            </>
          )}

          {canCreateChallan && (
            <Link href={`/sales/delivery-challans/new?saleOrderId=${id}`}>
              <Button size="sm" variant="outline">
                <Icon name="truck" size={14} /> Create Delivery Challan
              </Button>
            </Link>
          )}

          {canConvertInvoice && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleConvertToInvoice}
              loading={convertMutation.isPending}
            >
              <Icon name="file-check" size={14} /> Convert to Invoice
            </Button>
          )}

          {canCancel && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleCancel}
              loading={cancelMutation.isPending}
            >
              <Icon name="x-circle" size={14} /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Customer Info
            </h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Customer ID</dt>
                <dd className="font-medium">{order.customerId}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Customer Type</dt>
                <dd>
                  <Badge variant="secondary">{order.customerType}</Badge>
                </dd>
              </div>
              {order.creditDays != null && (
                <div>
                  <dt className="text-xs text-gray-400">Credit Days</dt>
                  <dd>{order.creditDays}</dd>
                </div>
              )}
              {order.paymentTerms && (
                <div>
                  <dt className="text-xs text-gray-400">Payment Terms</dt>
                  <dd>{order.paymentTerms}</dd>
                </div>
              )}
              {order.remarks && (
                <div className="col-span-2">
                  <dt className="text-xs text-gray-400">Remarks</dt>
                  <dd>{order.remarks}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Completion progress */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">
              Completion Progress
            </h3>
            <div className="flex items-center gap-4">
              <div className="h-3 flex-1 rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(completionPct, 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">{completionPct}%</span>
            </div>
          </div>

          {/* Items table */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Order Items
            </h3>
            {items.length === 0 ? (
              <p className="text-sm text-gray-400">No items</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        #
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Product
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Ordered
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Delivered
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Pending
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Returned
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Unit Price
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
                    {items.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>{idx + 1}</td>
                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 500 }}>
                          {item.productId}
                          {item.hsnCode && (
                            <span className="ml-2 text-xs text-gray-400">HSN: {item.hsnCode}</span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {item.orderedQty}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {item.deliveredQty}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {item.pendingQty}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {item.returnedQty}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {fmt(item.unitPrice)}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                          {fmt(item.taxAmount)}
                          {item.taxRate != null && (
                            <span className="ml-1 text-xs text-gray-400">({item.taxRate}%)</span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right", fontWeight: 500 }}>
                          {fmt(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Delivery Challans */}
          {challans.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Delivery Challans
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Challan No
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Status
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Dispatch Date
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Delivery Date
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Transporter
                      </th>
                      <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569", textAlign: "right" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {challans.map((challan) => {
                      const challanVariant = CHALLAN_STATUS_COLOR[challan.status] ?? "default";
                      return (
                        <tr key={challan.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "10px 12px", fontSize: 14 }}>
                            <Link
                              href={`/sales/delivery-challans/${challan.id}`}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {challan.challanNumber}
                            </Link>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <Badge variant={challanVariant}>
                              {challan.status.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 14 }}>
                            {challan.dispatchDate ? formatDate(challan.dispatchDate) : "\u2014"}
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 14 }}>
                            {challan.deliveryDate ? formatDate(challan.deliveryDate) : "\u2014"}
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 14 }}>
                            {challan.transporterName || "\u2014"}
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right" }}>
                            {fmt(challan.totalAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Summary card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Order Summary
            </h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd className="font-medium">{fmt(order.subtotal)}</dd>
              </div>
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Discount</dt>
                  <dd className="text-red-500">-{fmt(order.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Taxable</dt>
                <dd className="font-medium">{fmt(order.taxableAmount)}</dd>
              </div>
              {(order.cgstAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">CGST</dt>
                  <dd>{fmt(order.cgstAmount)}</dd>
                </div>
              )}
              {(order.sgstAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">SGST</dt>
                  <dd>{fmt(order.sgstAmount)}</dd>
                </div>
              )}
              {(order.igstAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">IGST</dt>
                  <dd>{fmt(order.igstAmount)}</dd>
                </div>
              )}
              {(order.cessAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cess</dt>
                  <dd>{fmt(order.cessAmount)}</dd>
                </div>
              )}
              {(order.roundOff ?? 0) !== 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Round Off</dt>
                  <dd>{fmt(order.roundOff)}</dd>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                <dt className="font-semibold">Grand Total</dt>
                <dd className="font-semibold text-base">{fmt(order.grandTotal)}</dd>
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
                <dt className="text-xs text-gray-400">Order Number</dt>
                <dd className="font-medium">{order.orderNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Order Date</dt>
                <dd>{formatDate(order.orderDate)}</dd>
              </div>
              {order.approvedAt && (
                <div>
                  <dt className="text-xs text-gray-400">Approved At</dt>
                  <dd>{formatDate(order.approvedAt)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-400">Created At</dt>
                <dd>{formatDate(order.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Completion</dt>
                <dd className="font-medium">{completionPct}%</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
