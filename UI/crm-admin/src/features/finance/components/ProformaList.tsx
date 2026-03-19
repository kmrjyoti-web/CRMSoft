'use client';

import { useMemo } from "react";

import { TableFull } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useTableFilters } from "@/hooks/useTableFilters";
import { TableSkeleton } from "@/components/common/TableSkeleton";

import { useProformaList } from "../hooks/useProforma";
import { PROFORMA_FILTER_CONFIG } from "../utils/proforma-filters";
import { ProformaForm } from "./ProformaForm";
import type {
  ProformaListItem,
  ProformaListParams,
} from "../types/proforma.types";

import { formatCurrency } from "@/lib/format-currency";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const PROFORMA_COLUMNS = [
  { id: "proformaNo", label: "Proforma No", visible: true },
  { id: "billingName", label: "Billing Name", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "totalAmount", label: "Total Amount", visible: true },
  { id: "proformaDate", label: "Proforma Date", visible: true },
  { id: "validUntil", label: "Valid Until", visible: true },
  { id: "createdAt", label: "Created At", visible: false },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function flattenProformas(items: ProformaListItem[]): Record<string, unknown>[] {
  return items.map((pi) => ({
    id: pi.id,
    proformaNo: pi.proformaNo,
    billingName: pi.billingName || "\u2014",
    status: pi.status,
    totalAmount: formatCurrency(pi.totalAmount),
    proformaDate: pi.proformaDate
      ? new Date(pi.proformaDate).toLocaleDateString("en-IN")
      : "\u2014",
    validUntil: pi.validUntil
      ? new Date(pi.validUntil).toLocaleDateString("en-IN")
      : "\u2014",
    createdAt: pi.createdAt
      ? new Date(pi.createdAt).toLocaleDateString("en-IN")
      : "\u2014",
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProformaList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "proforma-invoice",
    entityLabel: "Proforma Invoice",
    FormComponent: ProformaForm,
    idProp: "proformaId",
    editRoute: "/finance/proforma-invoices/:id",
    createRoute: "/finance/proforma-invoices/new",
    displayField: "proformaNo",
    panelWidth: 860,
  });

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(PROFORMA_FILTER_CONFIG);

  const params = useMemo<ProformaListParams>(
    () => ({ page: 1, limit: 50, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = useProformaList(params);

  const responseData = data?.data;
  const items: ProformaListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: ProformaListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenProformas(items), [items]);

  if (isLoading) return <TableSkeleton title="Proforma Invoices" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Proforma Invoices"
        columns={PROFORMA_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={PROFORMA_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
