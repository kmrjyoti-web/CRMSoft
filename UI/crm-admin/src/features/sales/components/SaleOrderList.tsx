"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useSaleOrderList } from "../hooks/useSales";
import { SaleOrderForm } from "./SaleOrderForm";
import type { SaleOrder } from "../types/sales.types";

const COLUMNS = [
  { id: "orderNumber", label: "SO #", visible: true },
  { id: "customerId", label: "Customer", visible: true },
  { id: "customerType", label: "Type", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "grandTotal", label: "Total", visible: true },
  { id: "itemCount", label: "Items", visible: true },
  { id: "completionPercent", label: "Completion", visible: true },
  { id: "expectedDeliveryDate", label: "Expected Delivery", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, any> = {
    DRAFT: "secondary", PENDING_APPROVAL: "warning", CONFIRMED: "primary",
    PARTIALLY_DELIVERED: "primary", FULLY_DELIVERED: "success", INVOICED: "success",
    REJECTED: "danger", CANCELLED: "danger",
  };
  return map[status] ?? "secondary";
}

function flattenOrders(orders: SaleOrder[]): Record<string, any>[] {
  return orders.map((o) => ({
    id: o.id,
    orderNumber: <span style={{ fontWeight: 600 }}>{o.orderNumber}</span>,
    customerId: o.customerId.slice(0, 8) + "...",
    customerType: o.customerType,
    status: <Badge variant={getStatusVariant(o.status)}>{o.status.replace(/_/g, " ")}</Badge>,
    grandTotal: <span style={{ fontWeight: 600 }}>₹{Number(o.grandTotal).toLocaleString()}</span>,
    itemCount: o.items?.length ?? 0,
    completionPercent: `${o.completionPercent ?? 0}%`,
    expectedDeliveryDate: o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString() : "—",
    createdAt: new Date(o.createdAt).toLocaleDateString(),
  }));
}

export function SaleOrderList() {
  const { data, isLoading } = useSaleOrderList();
  const orders: SaleOrder[] = useMemo(() => {
    const d = data?.data;
    if (Array.isArray(d)) return d;
    return (d as any)?.data ?? [];
  }, [data]);
  const rows = useMemo(() => (isLoading ? [] : flattenOrders(orders)), [orders, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "sale-order",
    entityLabel: "Sale Order",
    FormComponent: SaleOrderForm,
    idProp: "soId",
    editRoute: "/sales/orders/:id",
    createRoute: "/sales/orders/new",
    displayField: "orderNumber",
    panelWidth: 800,
  });

  return (
    <TableFull
      data={rows}
      title="Sale Orders"
      tableKey="sale-orders"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
