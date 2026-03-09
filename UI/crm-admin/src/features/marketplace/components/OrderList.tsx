"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button, Badge, Icon, Modal, SelectInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useVendorOrders,
  useUpdateOrderStatus,
} from "../hooks/useMarketplace";
import type {
  MarketplaceOrder,
  UpdateOrderStatusDto,
} from "../types/marketplace.types";

// ── Status helpers ────────────────────────────────────────────────────────────

type BadgeVariant = "warning" | "primary" | "success" | "danger" | "secondary";

const ORDER_STATUS_VARIANT: Record<MarketplaceOrder["status"], BadgeVariant> = {
  PENDING: "warning",
  CONFIRMED: "primary",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const NEXT_STATUS_OPTIONS: Array<{
  label: string;
  value: UpdateOrderStatusDto["status"];
}> = [
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${amount.toLocaleString()}`;
}

// ── Table styles ──────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 14,
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

// ── Update Status Modal ───────────────────────────────────────────────────────

function UpdateStatusModal({
  order,
  open,
  onClose,
  onUpdate,
}: {
  order: MarketplaceOrder | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, status: UpdateOrderStatusDto["status"]) => Promise<void>;
}) {
  const [selectedStatus, setSelectedStatus] = useState<
    UpdateOrderStatusDto["status"] | ""
  >("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!order || !selectedStatus) return;
    setLoading(true);
    try {
      await onUpdate(order.id, selectedStatus as UpdateOrderStatusDto["status"]);
      setSelectedStatus("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Update Order #${order?.orderNumber ?? ""}`}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedStatus || loading}
          >
            {loading ? "Updating…" : "Update Status"}
          </Button>
        </div>
      }
    >
      <div style={{ padding: "8px 0" }}>
        <SelectInput
          label="New Status"
          value={selectedStatus}
          onChange={(v) => setSelectedStatus(v as UpdateOrderStatusDto["status"])}
          options={NEXT_STATUS_OPTIONS}
          leftIcon={<Icon name="repeat" size={16} />}
        />
      </div>
    </Modal>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function OrderList() {
  const { data, isLoading } = useVendorOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const orders = useMemo<MarketplaceOrder[]>(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleUpdateStatus = async (
    id: string,
    status: UpdateOrderStatusDto["status"],
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ id, dto: { status } });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const openUpdateModal = (order: MarketplaceOrder) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Icon name="receipt" size={18} color="#6366f1" />
          <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
            Orders
          </span>
          <Badge variant="secondary" style={{ marginLeft: "auto" }}>
            {orders.length}
          </Badge>
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
            <div style={{ marginBottom: 10 }}>
              <Icon name="receipt" size={40} color="#9ca3af" />
            </div>
            <p style={{ margin: 0 }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Order #</th>
                  <th style={thStyle}>Listing</th>
                  <th style={thStyle}>Buyer</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Tracking</th>
                  <th style={thStyle}>Date</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#6366f1",
                          fontFamily: "monospace",
                          fontSize: 13,
                        }}
                      >
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.listingTitle}
                    </td>
                    <td style={tdStyle}>{order.buyerName}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      {formatAmount(order.amount, order.currency)}
                    </td>
                    <td style={tdStyle}>
                      <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                        {order.status}
                      </Badge>
                    </td>
                    <td style={tdStyle}>
                      {order.trackingNumber ? (
                        <div style={{ fontSize: 12 }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              background: "#f3f4f6",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {order.trackingNumber}
                          </span>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 2,
                                color: "#6366f1",
                                marginLeft: 6,
                              }}
                            >
                              <Icon name="external-link" size={12} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>{formatDate(order.createdAt)}</td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.status !== "DELIVERED" &&
                        order.status !== "CANCELLED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateModal(order)}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Icon name="repeat" size={14} />
                              Update Status
                            </span>
                          </Button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UpdateStatusModal
        order={selectedOrder}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={handleUpdateStatus}
      />
    </>
  );
}
