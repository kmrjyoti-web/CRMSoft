"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useWarrantyClaims } from "../hooks/useAmcWarranty";
import { CLAIM_FILTER_CONFIG } from "../utils/amc-warranty-filters";
import type { WarrantyClaim, ClaimStatus } from "../types/amc-warranty.types";

const COLUMNS = [
  { id: "claimNumber", label: "Claim No", visible: true },
  { id: "warrantyNumber", label: "Warranty No", visible: true },
  { id: "issueDescription", label: "Issue", visible: true },
  { id: "claimStatus", label: "Status", visible: true },
  { id: "assignedToName", label: "Assigned To", visible: true },
  { id: "isCovered", label: "Covered", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

const STATUS_VARIANT: Record<ClaimStatus, string> = {
  OPEN: "warning",
  ASSIGNED: "primary",
  IN_PROGRESS: "secondary",
  RESOLVED: "success",
  CLOSED: "default",
  REJECTED: "danger",
};

function flattenClaims(items: WarrantyClaim[]): Record<string, unknown>[] {
  return items.map((c) => ({
    id: c.id,
    claimNumber: c.claimNumber,
    warrantyNumber: c.warrantyRecord?.warrantyNumber ?? "—",
    issueDescription:
      c.issueDescription.length > 60
        ? `${c.issueDescription.slice(0, 60)}...`
        : c.issueDescription,
    claimStatus: (
      <Badge variant={(STATUS_VARIANT[c.status] as any) ?? "default"}>
        {c.status}
      </Badge>
    ),
    assignedToName: c.assignedToName ?? "—",
    isCovered: c.isCovered ? (
      <Badge variant="success">Covered</Badge>
    ) : (
      <Badge variant="danger">Not Covered</Badge>
    ),
    createdAt: new Date(c.createdAt).toLocaleDateString("en-IN"),
  }));
}

export function WarrantyClaimList() {
  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(CLAIM_FILTER_CONFIG);

  const params = useMemo(
    () => ({ page: 1, limit: 50, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = useWarrantyClaims(params);

  const responseData = data?.data;
  const items: WarrantyClaim[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: WarrantyClaim[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenClaims(items), [items]);

  if (isLoading) return <TableSkeleton title="Warranty Claims" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="Warranty Claims"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={CLAIM_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onCreate={() => {}}
      />
    </div>
  );
}
