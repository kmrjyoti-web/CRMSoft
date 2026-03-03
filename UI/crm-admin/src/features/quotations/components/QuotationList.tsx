"use client";

import { useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import { TableFull } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { formatDate } from "@/lib/format-date";

import { useQuotationsList } from "../hooks/useQuotations";

import { QUOTATION_FILTER_CONFIG } from "../utils/quotation-filters";

import type {
  QuotationListItem,
  QuotationListParams,
} from "../types/quotations.types";

// -- Column definitions ------------------------------------------------------

const QUOTATION_COLUMNS = [
  { id: "quotationNo", label: "Quotation No", visible: true },
  { id: "title", label: "Title", visible: true },
  { id: "lead", label: "Lead", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "totalAmount", label: "Total Amount", visible: true },
  { id: "validUntil", label: "Valid Until", visible: true },
  { id: "createdAt", label: "Created", visible: false },
];

// -- Helpers -----------------------------------------------------------------

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "\u2014";
  return `\u20B9${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function flattenQuotations(
  items: QuotationListItem[],
): Record<string, unknown>[] {
  return items.map((q) => {
    const leadDisplay = q.lead
      ? q.lead.contact
        ? `${q.lead.leadNumber} \u2013 ${q.lead.contact.firstName} ${q.lead.contact.lastName}`
        : q.lead.leadNumber
      : "\u2014";

    return {
      id: q.id,
      quotationNo: q.quotationNo,
      title: q.title || "\u2014",
      lead: leadDisplay,
      status: q.status,
      totalAmount: formatCurrency(q.totalAmount),
      validUntil: q.validUntil ? formatDate(q.validUntil) : "\u2014",
      createdAt: q.createdAt
        ? new Date(q.createdAt).toLocaleDateString()
        : "\u2014",
    };
  });
}

// -- Component ---------------------------------------------------------------

export function QuotationList() {
  const router = useRouter();

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(QUOTATION_FILTER_CONFIG);

  const params = useMemo<QuotationListParams>(
    () => ({
      page: 1,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useQuotationsList(params);

  const responseData = data?.data;
  const items: QuotationListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: QuotationListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenQuotations(items), [items]);

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/quotations/${row.id}`);
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    router.push("/quotations/new");
  }, [router]);

  if (isLoading) return <TableSkeleton title="Quotations" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Quotations"
        columns={QUOTATION_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={QUOTATION_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
