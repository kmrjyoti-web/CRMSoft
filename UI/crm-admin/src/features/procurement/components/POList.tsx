"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { usePOList } from "../hooks/useProcurement";
import { POForm } from "./POForm";
import type { PurchaseOrder } from "../types/procurement.types";

const COLUMNS = [
  { id: "poNumber", label: "PO #", visible: true },
  { id: "vendorId", label: "Vendor", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "grandTotal", label: "Total", visible: true },
  { id: "itemCount", label: "Items", visible: true },
  { id: "grnCount", label: "GRN", visible: true },
  { id: "expectedDeliveryDate", label: "Expected Delivery", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, any> = {
    DRAFT: "secondary", PENDING_APPROVAL: "warning", APPROVED: "primary",
    PARTIALLY_RECEIVED: "primary", COMPLETED: "success", REJECTED: "danger", CANCELLED: "danger",
  };
  return map[status] ?? "secondary";
}

function flattenPOs(pos: PurchaseOrder[]): Record<string, any>[] {
  return pos.map((po) => ({
    id: po.id,
    poNumber: <span style={{ fontWeight: 600 }}>{po.poNumber}</span>,
    vendorId: po.vendorId.slice(0, 8) + "...",
    status: <Badge variant={getStatusVariant(po.status)}>{po.status.replace(/_/g, " ")}</Badge>,
    grandTotal: <span style={{ fontWeight: 600 }}>₹{Number(po.grandTotal).toLocaleString()}</span>,
    itemCount: po.items?.length ?? 0,
    grnCount: po._count?.goodsReceipts ?? 0,
    expectedDeliveryDate: po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : "—",
    createdAt: new Date(po.createdAt).toLocaleDateString(),
  }));
}

export function POList() {
  const { data, isLoading } = usePOList();
  const pos: PurchaseOrder[] = (data?.data ?? []) as PurchaseOrder[];
  const rows = useMemo(() => (isLoading ? [] : flattenPOs(pos)), [pos, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "po",
    entityLabel: "Purchase Order",
    FormComponent: POForm,
    idProp: "poId",
    editRoute: "/procurement/purchase-orders/:id",
    createRoute: "/procurement/purchase-orders/new",
    displayField: "poNumber",
    panelWidth: 800,
  });

  return (
    <TableFull
      data={rows}
      title="Purchase Orders"
      tableKey="procurement-po"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
