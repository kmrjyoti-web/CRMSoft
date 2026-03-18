"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useServiceVisits } from "../hooks/useAmcWarranty";
import { SERVICE_VISIT_FILTER_CONFIG } from "../utils/amc-warranty-filters";
import type {
  ServiceVisitLog,
  VisitStatus,
  VisitSourceType,
} from "../types/amc-warranty.types";

const COLUMNS = [
  { id: "visitNumber", label: "Visit No", visible: true },
  { id: "sourceTypeBadge", label: "Source", visible: true },
  { id: "customerName", label: "Customer", visible: true },
  { id: "technicianName", label: "Technician", visible: true },
  { id: "visitDate", label: "Visit Date", visible: true },
  { id: "visitType", label: "Type", visible: true },
  { id: "visitStatus", label: "Status", visible: true },
  { id: "isBillable", label: "Billable", visible: true },
  { id: "chargeAmount", label: "Charge", visible: true },
];

const STATUS_VARIANT: Record<VisitStatus, string> = {
  SCHEDULED: "primary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const SOURCE_VARIANT: Record<VisitSourceType, string> = {
  WARRANTY_CLAIM: "primary",
  AMC_SCHEDULE: "success",
  AMC_ON_DEMAND: "warning",
  PAID_SERVICE: "secondary",
};

function flattenVisits(
  items: ServiceVisitLog[],
): Record<string, unknown>[] {
  return items.map((v) => ({
    id: v.id,
    visitNumber: v.visitNumber,
    sourceTypeBadge: (
      <Badge variant={(SOURCE_VARIANT[v.sourceType] as any) ?? "default"}>
        {v.sourceType.replace(/_/g, " ")}
      </Badge>
    ),
    customerName: v.customerName ?? "—",
    technicianName: v.technicianName ?? "—",
    visitDate: new Date(v.visitDate).toLocaleDateString("en-IN"),
    visitType: v.visitType,
    visitStatus: (
      <Badge variant={(STATUS_VARIANT[v.status] as any) ?? "default"}>
        {v.status}
      </Badge>
    ),
    isBillable: v.isBillable ? (
      <Badge variant="warning">Billable</Badge>
    ) : (
      <Badge variant="outline">Free</Badge>
    ),
    chargeAmount: v.chargeAmount
      ? `₹${Number(v.chargeAmount).toLocaleString("en-IN")}`
      : "—",
  }));
}

export function ServiceVisitList() {
  const router = useRouter();

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(SERVICE_VISIT_FILTER_CONFIG);

  const params = useMemo(
    () => ({ page: 1, limit: 50, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = useServiceVisits(params);

  const responseData = data?.data;
  const items: ServiceVisitLog[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: ServiceVisitLog[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenVisits(items), [items]);

  if (isLoading) return <TableSkeleton title="Service Visits" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Service Visits"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={SERVICE_VISIT_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={(row) =>
          router.push(`/post-sales/service-visits/${row.id}`)
        }
        onCreate={() => {}}
      />
    </div>
  );
}
