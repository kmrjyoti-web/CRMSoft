"use client";

import { useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import { TableFull } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { formatDate } from "@/lib/format-date";

import { useTourPlansList } from "../hooks/useTourPlans";

import { TOUR_PLAN_FILTER_CONFIG } from "../utils/tour-plan-filters";

import type {
  TourPlanListItem,
  TourPlanListParams,
} from "../types/tour-plans.types";

// -- Column definitions ------------------------------------------------------

const TOUR_PLAN_COLUMNS = [
  { id: "title", label: "Title", visible: true },
  { id: "planDate", label: "Plan Date", visible: true },
  { id: "lead", label: "Lead", visible: true },
  { id: "salesPerson", label: "Sales Person", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "visits", label: "Visits", visible: true },
];

// -- Helpers -----------------------------------------------------------------

function flattenTourPlans(
  items: TourPlanListItem[],
): Record<string, unknown>[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    planDate: item.planDate ? formatDate(item.planDate) : "\u2014",
    lead: item.lead?.leadNumber ?? "\u2014",
    salesPerson: item.salesPerson
      ? `${item.salesPerson.firstName} ${item.salesPerson.lastName}`
      : "\u2014",
    status: item.status.replace(/_/g, " "),
    visits: item._count?.visits ?? 0,
  }));
}

// -- Component ---------------------------------------------------------------

export function TourPlanList() {
  const router = useRouter();

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(TOUR_PLAN_FILTER_CONFIG);

  const params = useMemo<TourPlanListParams>(
    () => ({
      page: 1,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useTourPlansList(params);

  const responseData = data?.data;
  const items: TourPlanListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: TourPlanListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenTourPlans(items), [items]);

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/tour-plans/${row.id}`);
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    router.push("/tour-plans/new");
  }, [router]);

  if (isLoading) return <TableSkeleton title="Tour Plans" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Tour Plans"
        columns={TOUR_PLAN_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={TOUR_PLAN_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
