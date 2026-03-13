"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useWarrantyRecords } from "../hooks/useAmcWarranty";
import { WARRANTY_FILTER_CONFIG } from "../utils/amc-warranty-filters";
import { WarrantyForm } from "./WarrantyForm";
import type { WarrantyRecord, WarrantyStatus } from "../types/amc-warranty.types";

const COLUMNS = [
  { id: "warrantyNumber", label: "Warranty No", visible: true },
  { id: "customerName", label: "Customer", visible: true },
  { id: "productName", label: "Product", visible: true },
  { id: "statusBadge", label: "Status", visible: true },
  { id: "startDate", label: "Start Date", visible: true },
  { id: "endDate", label: "End Date", visible: true },
  { id: "duration", label: "Duration", visible: true },
  { id: "claimsUsed", label: "Claims Used", visible: false },
];

const STATUS_VARIANT: Record<WarrantyStatus, string> = {
  ACTIVE: "success",
  EXPIRED: "danger",
  EXTENDED: "warning",
  CLAIMED: "secondary",
  VOIDED: "outline",
};

function flattenWarranties(items: WarrantyRecord[]): Record<string, unknown>[] {
  return items.map((w) => ({
    id: w.id,
    warrantyNumber: w.warrantyNumber,
    customerName: w.customerName ?? "—",
    productName: w.productName ?? "—",
    statusBadge: (
      <Badge variant={(STATUS_VARIANT[w.status] as any) ?? "default"}>
        {w.status}
      </Badge>
    ),
    startDate: w.startDate
      ? new Date(w.startDate).toLocaleDateString("en-IN")
      : "—",
    endDate: w.endDate
      ? new Date(w.endDate).toLocaleDateString("en-IN")
      : "—",
    duration: w.template
      ? `${w.template.durationValue} ${w.template.durationType.toLowerCase()}`
      : "—",
    claimsUsed: w.claimsUsed,
  }));
}

export function WarrantyList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "warranty",
    entityLabel: "Warranty",
    FormComponent: WarrantyForm,
    idProp: "warrantyId",
    editRoute: "/post-sales/warranty/:id/edit",
    createRoute: "/post-sales/warranty/new",
    displayField: "warrantyNumber",
  });

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(WARRANTY_FILTER_CONFIG);

  const params = useMemo(
    () => ({ page: 1, limit: 10000, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = useWarrantyRecords(params);

  const responseData = data?.data;
  const items: WarrantyRecord[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: WarrantyRecord[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenWarranties(items), [items]);

  if (isLoading) return <TableSkeleton title="Warranties" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Warranties"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={WARRANTY_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
