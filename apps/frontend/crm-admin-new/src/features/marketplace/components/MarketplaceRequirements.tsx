"use client";
import { useState, useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useRequirements } from "../hooks/useMarketplace";
import type { MarketplaceListing } from "../types/marketplace.types";

const COLUMNS = [
  { id: "title", label: "Title", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "budget", label: "Budget (INR)", visible: true },
  { id: "minOrderQty", label: "Min Qty", visible: true },
  { id: "reviewCount", label: "Quotes", visible: true },
  { id: "createdAt", label: "Posted", visible: true },
];

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "danger" | "default"> = {
  ACTIVE: 'success',
  DRAFT: 'secondary',
  EXPIRED: 'danger',
  ARCHIVED: 'default',
};

export function MarketplaceRequirementsPage() {
  const [params] = useState({ page: 1, limit: 50 });
  const { data, isLoading } = useRequirements(params);

  const requirements = useMemo<MarketplaceListing[]>(() => {
    const nested = (data as { data?: { data?: MarketplaceListing[] } | MarketplaceListing[] })?.data;
    if (!nested) return [];
    if (Array.isArray(nested)) return nested;
    return (nested as { data?: MarketplaceListing[] }).data ?? [];
  }, [data]);

  const tableData = useMemo(
    () =>
      requirements.map((r) => ({
        ...r,
        status: <Badge variant={STATUS_VARIANT[r.status] ?? 'default'}>{r.status}</Badge>,
        budget: r.basePrice ? `\u20B9${(r.basePrice / 100).toLocaleString('en-IN')}` : '\u2014',
        createdAt: new Date(r.createdAt).toLocaleDateString('en-IN'),
      })),
    [requirements],
  );

  if (isLoading) return <TableSkeleton title="Requirements" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, unknown>[]}
          title="Marketplace Requirements"
          tableKey="marketplace-requirements"
          columns={COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          onRowEdit={(row: Record<string, unknown>) => console.log('view requirement', row.id)}
        />
      </div>
    </div>
  );
}
