"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge } from "@/components/ui";
import { useRecipeList, useDeactivateRecipe } from "../hooks/useBOM";
import type { BOMFormula } from "../types/bom.types";

const COLUMNS = [
  { id: "formulaCode", label: "Code", visible: true },
  { id: "formulaName", label: "Recipe Name", visible: true },
  { id: "yieldInfo", label: "Yield", visible: true },
  { id: "itemCount", label: "Ingredients", visible: true },
  { id: "prepCook", label: "Prep / Cook", visible: true },
  { id: "version", label: "Version", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "industry", label: "Industry", visible: true },
];

function flatten(recipes: BOMFormula[]): Record<string, unknown>[] {
  return recipes.map((r) => ({
    id: r.id,
    formulaCode: r.formulaCode,
    formulaName: <span style={{ fontWeight: 600 }}>{r.formulaName}</span>,
    yieldInfo: `${r.yieldQuantity} ${r.yieldUnit}`,
    itemCount: r.items?.length ?? 0,
    prepCook: [r.prepTime && `${r.prepTime}m prep`, r.cookTime && `${r.cookTime}m cook`].filter(Boolean).join(" / ") || "—",
    version: `v${r.version}`,
    status: r.isActive
      ? <Badge variant="success">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>,
    industry: r.industryCode || "—",
  }));
}

export function RecipeList() {
  const router = useRouter();
  const { data, isLoading } = useRecipeList();
  const deactivate = useDeactivateRecipe();

  const recipes: BOMFormula[] = ((data as any)?.data ?? []) as BOMFormula[];
  const rows = useMemo(() => (isLoading ? [] : flatten(recipes)), [recipes, isLoading]);

  return (
    <TableFull
      data={rows}
      title="Recipes / BOM"
      tableKey="inventory-recipes"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onCreate={() => router.push("/inventory/recipes/new")}
      onRowEdit={(row) => router.push(`/inventory/recipes/${row.id}`)}
    />
  );
}
