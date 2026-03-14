"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge } from "@/components/ui";
import { useProductionList } from "../hooks/useBOM";
import type { BOMProduction } from "../types/bom.types";

const STATUS_VARIANT: Record<string, string> = {
  PLANNED: "warning",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const COLUMNS = [
  { id: "date", label: "Date", visible: true },
  { id: "recipe", label: "Recipe", visible: true },
  { id: "ordered", label: "Ordered", visible: true },
  { id: "produced", label: "Produced", visible: true },
  { id: "scrap", label: "Scrap", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "yieldRate", label: "Yield %", visible: true },
];

function flatten(productions: BOMProduction[]): Record<string, any>[] {
  return productions.map((p) => {
    const yieldRate = p.quantityOrdered > 0
      ? Math.round((p.quantityProduced / p.quantityOrdered) * 100)
      : 0;
    return {
      id: p.id,
      date: new Date(p.productionDate).toLocaleDateString(),
      recipe: <span style={{ fontWeight: 600 }}>{p.formula?.formulaName ?? p.formulaId}</span>,
      ordered: p.quantityOrdered,
      produced: p.quantityProduced,
      scrap: p.scrapQuantity > 0
        ? <span style={{ color: "#e55353" }}>{p.scrapQuantity}</span>
        : "0",
      status: <Badge variant={(STATUS_VARIANT[p.status] ?? "secondary") as any}>{p.status}</Badge>,
      yieldRate: p.status === "COMPLETED"
        ? <span style={{ fontWeight: 600 }}>{yieldRate}%</span>
        : "—",
    };
  });
}

export function ProductionList() {
  const router = useRouter();
  const { data, isLoading } = useProductionList();

  const productions: BOMProduction[] = ((data as any)?.data ?? []) as BOMProduction[];
  const rows = useMemo(() => (isLoading ? [] : flatten(productions)), [productions, isLoading]);

  return (
    <TableFull
      data={rows}
      title="Production Runs"
      tableKey="inventory-production"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onCreate={() => router.push("/inventory/production/new")}
      onRowEdit={(row) => router.push(`/inventory/production/${row.id}`)}
    />
  );
}
