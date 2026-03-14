"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useRFQList } from "../hooks/useProcurement";
import { RFQForm } from "./RFQForm";
import type { PurchaseRFQ } from "../types/procurement.types";

const COLUMNS = [
  { id: "rfqNumber", label: "RFQ #", visible: true },
  { id: "title", label: "Title", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "requiredByDate", label: "Required By", visible: true },
  { id: "itemCount", label: "Items", visible: true },
  { id: "quotationCount", label: "Quotations", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, any> = { DRAFT: "secondary", SENT: "primary", CLOSED: "success", CANCELLED: "danger" };
  return map[status] ?? "secondary";
}

function flattenRFQs(rfqs: PurchaseRFQ[]): Record<string, any>[] {
  return rfqs.map((rfq) => ({
    id: rfq.id,
    rfqNumber: <span style={{ fontWeight: 600 }}>{rfq.rfqNumber}</span>,
    title: rfq.title,
    status: <Badge variant={getStatusVariant(rfq.status)}>{rfq.status}</Badge>,
    requiredByDate: rfq.requiredByDate ? new Date(rfq.requiredByDate).toLocaleDateString() : "—",
    itemCount: rfq.items?.length ?? 0,
    quotationCount: rfq._count?.quotations ?? 0,
    createdAt: new Date(rfq.createdAt).toLocaleDateString(),
  }));
}

export function RFQList() {
  const { data, isLoading } = useRFQList();
  const rfqs: PurchaseRFQ[] = (data?.data ?? []) as PurchaseRFQ[];
  const rows = useMemo(() => (isLoading ? [] : flattenRFQs(rfqs)), [rfqs, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "rfq",
    entityLabel: "RFQ",
    FormComponent: RFQForm,
    idProp: "rfqId",
    editRoute: "/procurement/rfq/:id",
    createRoute: "/procurement/rfq/new",
    displayField: "title",
    panelWidth: 800,
  });

  return (
    <TableFull
      data={rows}
      title="Purchase RFQs"
      tableKey="procurement-rfq"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
