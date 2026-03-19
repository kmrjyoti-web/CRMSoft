"use client";

import { useMemo } from "react";

import { useEntityPanel } from "@/hooks/useEntityPanel";

import { TableFull } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { formatDate } from "@/lib/format-date";

import { useDemosList } from "../hooks/useDemos";
import { DemoForm } from "./DemoForm";

import { DEMO_FILTER_CONFIG } from "../utils/demo-filters";

import type {
  DemoListItem,
  DemoListParams,
} from "../types/demos.types";

// -- Column definitions ------------------------------------------------------

const DEMO_COLUMNS = [
  { id: "lead", label: "Lead", visible: true },
  { id: "mode", label: "Mode", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "scheduledAt", label: "Scheduled At", visible: true },
  { id: "conductedBy", label: "Conducted By", visible: true },
  { id: "result", label: "Result", visible: true },
];

// -- Helpers -----------------------------------------------------------------

function flattenDemos(items: DemoListItem[]): Record<string, unknown>[] {
  return items.map((demo) => ({
    id: demo.id,
    lead: demo.lead
      ? `${demo.lead.leadNumber}${demo.lead.contact ? ` - ${demo.lead.contact.firstName} ${demo.lead.contact.lastName}` : ""}`
      : "\u2014",
    mode: demo.mode,
    status: demo.status.replace(/_/g, " "),
    scheduledAt: demo.scheduledAt ? formatDate(demo.scheduledAt) : "\u2014",
    conductedBy: demo.conductedBy
      ? `${demo.conductedBy.firstName} ${demo.conductedBy.lastName}`
      : "\u2014",
    result: demo.result ? demo.result.replace(/_/g, " ") : "\u2014",
  }));
}

// -- Component ---------------------------------------------------------------

export function DemoList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "demo",
    entityLabel: "Demo",
    FormComponent: DemoForm,
    idProp: "demoId",
    editRoute: "/demos/:id/edit",
    createRoute: "/demos/new",
    displayField: "subject",
  });

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(DEMO_FILTER_CONFIG);

  const params = useMemo<DemoListParams>(
    () => ({
      page: 1,
      limit: 50,
      sortBy: "scheduledAt",
      sortOrder: "desc" as const,
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useDemosList(params);

  const responseData = data?.data;
  const items: DemoListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: DemoListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenDemos(items), [items]);

  if (isLoading) return <TableSkeleton title="Demos" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="Demos"
        columns={DEMO_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={DEMO_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
