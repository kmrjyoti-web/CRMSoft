'use client';

import { useMemo } from "react";

import { TableFull } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useTableFilters } from "@/hooks/useTableFilters";
import { TableSkeleton } from "@/components/common/TableSkeleton";

import { HelpButton } from "@/components/common/HelpButton";

import { useInvoicesList } from "../hooks/useFinance";
import { INVOICE_FILTER_CONFIG } from "../utils/invoice-filters";
import { InvoiceForm } from "./InvoiceForm";
import { InvoiceListUserHelp } from "../help/InvoiceListUserHelp";
import { InvoiceListDevHelp } from "../help/InvoiceListDevHelp";
import type {
  InvoiceListItem,
  InvoiceListParams,
} from "../types/finance.types";

import { formatCurrency } from "@/lib/format-currency";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const INVOICE_COLUMNS = [
  { id: "invoiceNo", label: "Invoice No", visible: true },
  { id: "billingName", label: "Billing Name", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "totalAmount", label: "Total Amount", visible: true },
  { id: "paidAmount", label: "Paid Amount", visible: true },
  { id: "balanceAmount", label: "Balance Amount", visible: true },
  { id: "dueDate", label: "Due Date", visible: true },
  { id: "invoiceDate", label: "Invoice Date", visible: false },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function flattenInvoices(items: InvoiceListItem[]): Record<string, unknown>[] {
  return items.map((inv) => ({
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    billingName: inv.billingName || "\u2014",
    status: inv.status,
    totalAmount: formatCurrency(inv.totalAmount),
    paidAmount: formatCurrency(inv.paidAmount),
    balanceAmount: formatCurrency(inv.balanceAmount),
    dueDate: inv.dueDate
      ? new Date(inv.dueDate).toLocaleDateString("en-IN")
      : "\u2014",
    invoiceDate: inv.invoiceDate
      ? new Date(inv.invoiceDate).toLocaleDateString("en-IN")
      : "\u2014",
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvoiceList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "invoice",
    entityLabel: "Invoice",
    FormComponent: InvoiceForm,
    idProp: "invoiceId",
    editRoute: "/finance/invoices/:id",
    createRoute: "/finance/invoices/new",
    displayField: "invoiceNo",
    panelWidth: 860,
  });

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(INVOICE_FILTER_CONFIG);

  const params = useMemo<InvoiceListParams>(
    () => ({ page: 1, limit: 50, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = useInvoicesList(params);

  const responseData = data?.data;
  const items: InvoiceListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: InvoiceListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenInvoices(items), [items]);

  if (isLoading) return <TableSkeleton title="Invoices" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="Invoices"
        columns={INVOICE_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={INVOICE_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
        headerActions={
          <HelpButton
            panelId="invoices-list-help"
            title="Invoices — Help"
            userContent={<InvoiceListUserHelp />}
            devContent={<InvoiceListDevHelp />}
          />
        }
      />
    </div>
  );
}
