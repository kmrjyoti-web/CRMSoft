"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useQuotationList } from "../hooks/useProcurement";
import { QuotationForm } from "./QuotationForm";
import type { PurchaseQuotation } from "../types/procurement.types";

const COLUMNS = [
  { id: "quotationNumber", label: "Quotation #", visible: true },
  { id: "vendorId", label: "Vendor", visible: true },
  { id: "rfqNumber", label: "RFQ #", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "grandTotal", label: "Total", visible: true },
  { id: "creditDays", label: "Credit Days", visible: true },
  { id: "deliveryDays", label: "Delivery Days", visible: true },
  { id: "createdAt", label: "Date", visible: true },
];

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, "primary" | "success" | "warning" | "secondary" | "danger"> = {
    RECEIVED: "primary", UNDER_REVIEW: "warning", ACCEPTED: "success",
    REJECTED: "danger", EXPIRED: "secondary",
  };
  return map[status] ?? "secondary";
}

function flattenQuotations(quotations: PurchaseQuotation[]): Record<string, unknown>[] {
  return quotations.map((q) => ({
    id: q.id,
    quotationNumber: <span style={{ fontWeight: 600 }}>{q.quotationNumber}</span>,
    vendorId: q.vendorId.slice(0, 8) + "...",
    rfqNumber: q.rfq?.rfqNumber ?? "—",
    status: <Badge variant={getStatusVariant(q.status)}>{q.status}</Badge>,
    grandTotal: q.grandTotal ? `₹${Number(q.grandTotal).toLocaleString()}` : "—",
    creditDays: q.creditDays ?? "—",
    deliveryDays: q.deliveryDays ?? "—",
    createdAt: new Date(q.createdAt).toLocaleDateString(),
  }));
}

export function QuotationList() {
  const { data, isLoading } = useQuotationList();
  const quotations: PurchaseQuotation[] = (data?.data ?? []) as PurchaseQuotation[];
  const rows = useMemo(() => (isLoading ? [] : flattenQuotations(quotations)), [quotations, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "quotation",
    entityLabel: "Purchase Quotation",
    FormComponent: QuotationForm,
    idProp: "quotationId",
    editRoute: "/procurement/quotations/:id",
    createRoute: "/procurement/quotations/new",
    displayField: "quotationNumber",
    panelWidth: 800,
  });

  return (
    <TableFull
      data={rows}
      title="Purchase Quotations"
      tableKey="procurement-quotations"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
