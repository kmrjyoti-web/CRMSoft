"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import { TableFull, Badge, Button } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useAMCPlans, useImportAMCPlan } from "../hooks/useAmcWarranty";
import { AMC_PLAN_FILTER_CONFIG } from "../utils/amc-warranty-filters";
import type { AMCPlanTemplate, PlanTier } from "../types/amc-warranty.types";

const COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "code", label: "Code", visible: true },
  { id: "tierBadge", label: "Tier", visible: true },
  { id: "industryCode", label: "Industry", visible: true },
  { id: "charges", label: "Charges", visible: true },
  { id: "duration", label: "Duration", visible: true },
  { id: "freeVisits", label: "Free Visits", visible: true },
  { id: "slaResponseHours", label: "SLA (hours)", visible: true },
  { id: "systemBadge", label: "Type", visible: false },
];

const TIER_VARIANT: Record<PlanTier, string> = {
  BASIC: "default",
  SILVER: "secondary",
  GOLD: "warning",
  PLATINUM: "primary",
  CUSTOM: "outline",
};

function flattenPlans(
  items: AMCPlanTemplate[],
  onImport: (id: string) => void,
): Record<string, unknown>[] {
  return items.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    tierBadge: (
      <Badge variant={(TIER_VARIANT[p.planTier] as any) ?? "default"}>
        {p.planTier}
      </Badge>
    ),
    industryCode: p.industryCode ?? "—",
    charges: `₹${Number(p.charges).toLocaleString("en-IN")}`,
    duration: `${p.durationValue} ${p.durationType.toLowerCase()}`,
    freeVisits: p.freeVisits,
    slaResponseHours: p.slaResponseHours ? `${p.slaResponseHours}h` : "—",
    systemBadge: p.isSystemTemplate ? (
      <Badge variant="primary">System</Badge>
    ) : (
      <Badge variant="outline">Tenant</Badge>
    ),
    actions: p.isSystemTemplate ? (
      <Button
        size="sm"
        variant="outline"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onImport(p.id);
        }}
      >
        Import
      </Button>
    ) : null,
  }));
}

export function AMCPlanList() {
  const importPlan = useImportAMCPlan();

  const handleImport = async (id: string) => {
    try {
      await importPlan.mutateAsync(id);
      toast.success("AMC plan imported successfully");
    } catch {
      toast.error("Failed to import AMC plan");
    }
  };

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(AMC_PLAN_FILTER_CONFIG);

  const params = useMemo(
    () => ({ page: 1, limit: 50, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = useAMCPlans(params);

  const responseData = data?.data;
  const items: AMCPlanTemplate[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: AMCPlanTemplate[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(
    () => flattenPlans(items, handleImport),
    [items, handleImport],
  );

  if (isLoading) return <TableSkeleton title="AMC Plans" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="AMC Plans"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={AMC_PLAN_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onCreate={() => {}}
      />
    </div>
  );
}
