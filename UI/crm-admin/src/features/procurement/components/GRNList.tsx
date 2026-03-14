"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useGRNList } from "../hooks/useProcurement";
import { GRNForm } from "./GRNForm";
import type { GoodsReceipt } from "../types/procurement.types";

const COLUMNS = [
  { id: "receiptNumber", label: "GRN #", visible: true },
  { id: "receiptType", label: "Type", visible: true },
  { id: "poNumber", label: "PO #", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "vendorChallanNo", label: "Challan #", visible: true },
  { id: "itemCount", label: "Items", visible: true },
  { id: "receiptDate", label: "Date", visible: true },
];

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, any> = {
    DRAFT: "secondary", INSPECTED: "warning", ACCEPTED: "success", REJECTED: "danger",
  };
  return map[status] ?? "secondary";
}

function flattenGRNs(grns: GoodsReceipt[]): Record<string, any>[] {
  return grns.map((grn) => ({
    id: grn.id,
    receiptNumber: <span style={{ fontWeight: 600 }}>{grn.receiptNumber}</span>,
    receiptType: <Badge variant="secondary">{grn.receiptType}</Badge>,
    poNumber: grn.po?.poNumber ?? "—",
    status: <Badge variant={getStatusVariant(grn.status)}>{grn.status}</Badge>,
    vendorChallanNo: grn.vendorChallanNo ?? "—",
    itemCount: grn.items?.length ?? 0,
    receiptDate: new Date(grn.receiptDate).toLocaleDateString(),
  }));
}

export function GRNList() {
  const { data, isLoading } = useGRNList();
  const grns: GoodsReceipt[] = (data?.data ?? []) as GoodsReceipt[];
  const rows = useMemo(() => (isLoading ? [] : flattenGRNs(grns)), [grns, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "grn",
    entityLabel: "Goods Receipt",
    FormComponent: GRNForm,
    idProp: "grnId",
    editRoute: "/procurement/goods-receipts/:id",
    createRoute: "/procurement/goods-receipts/new",
    displayField: "receiptNumber",
    panelWidth: 800,
  });

  return (
    <TableFull
      data={rows}
      title="Goods Receipts"
      tableKey="procurement-grn"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
