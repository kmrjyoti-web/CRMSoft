"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useInvoiceList } from "../hooks/useProcurement";
import { PurchaseInvoiceForm } from "./PurchaseInvoiceForm";
import type { PurchaseInvoice } from "../types/procurement.types";

const COLUMNS = [
  { id: "ourReference", label: "Invoice #", visible: true },
  { id: "vendorInvoiceNo", label: "Vendor Inv #", visible: true },
  { id: "vendorId", label: "Vendor", visible: true },
  { id: "poNumber", label: "PO #", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "grandTotal", label: "Total", visible: true },
  { id: "paymentStatus", label: "Payment", visible: true },
  { id: "dueDate", label: "Due Date", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, any> = {
    DRAFT: "secondary", PENDING_APPROVAL: "warning", APPROVED: "primary",
    PAID: "success", REJECTED: "danger", CANCELLED: "danger",
  };
  return map[status] ?? "secondary";
}

function getPaymentVariant(status: string): "success" | "warning" | "danger" | "secondary" {
  const map: Record<string, any> = {
    PAID: "success", PARTIAL: "warning", UNPAID: "danger",
  };
  return map[status] ?? "secondary";
}

function flattenInvoices(invoices: PurchaseInvoice[]): Record<string, any>[] {
  return invoices.map((inv) => ({
    id: inv.id,
    ourReference: <span style={{ fontWeight: 600 }}>{inv.ourReference}</span>,
    vendorInvoiceNo: inv.vendorInvoiceNo,
    vendorId: inv.vendorId.slice(0, 8) + "...",
    poNumber: inv.po?.poNumber ?? "—",
    status: <Badge variant={getStatusVariant(inv.status)}>{inv.status.replace(/_/g, " ")}</Badge>,
    grandTotal: <span style={{ fontWeight: 600 }}>₹{Number(inv.grandTotal).toLocaleString()}</span>,
    paymentStatus: <Badge variant={getPaymentVariant(inv.paymentStatus)}>{inv.paymentStatus}</Badge>,
    dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—",
    createdAt: new Date(inv.createdAt).toLocaleDateString(),
  }));
}

export function InvoiceList() {
  const { data, isLoading } = useInvoiceList();
  const invoices: PurchaseInvoice[] = (data?.data ?? []) as PurchaseInvoice[];
  const rows = useMemo(() => (isLoading ? [] : flattenInvoices(invoices)), [invoices, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "purchase-invoice",
    entityLabel: "Purchase Invoice",
    FormComponent: PurchaseInvoiceForm,
    idProp: "invoiceId",
    editRoute: "/procurement/invoices/:id",
    createRoute: "/procurement/invoices/new",
    displayField: "ourReference",
    panelWidth: 800,
  });

  return (
    <TableFull
      data={rows}
      title="Purchase Invoices"
      tableKey="procurement-invoices"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
