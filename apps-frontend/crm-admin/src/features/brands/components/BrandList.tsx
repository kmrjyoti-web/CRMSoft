"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useBrands } from "../hooks/useBrands";
import { BrandForm } from "./BrandForm";
import type { Brand } from "../types/brands.types";

const BRAND_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "code", label: "Code", visible: true },
  { id: "description", label: "Description", visible: true },
  { id: "website", label: "Website", visible: true },
  { id: "status", label: "Status", visible: true },
];

function flattenBrands(brands: Brand[]): Record<string, unknown>[] {
  return brands.map((b) => ({
    id: b.id,
    name: <span style={{ fontWeight: 600 }}>{b.name}</span>,
    code: <Badge variant="outline">{b.code}</Badge>,
    description: b.description ?? "—",
    website: b.website ?? "—",
    status: <Badge variant={b.isActive ? "success" : "secondary"}>{b.isActive ? "Active" : "Inactive"}</Badge>,
  }));
}

export function BrandList() {
  const { data, isLoading } = useBrands({});
  const brands: Brand[] = useMemo(() => {
    const raw = data?.data;
    if (Array.isArray(raw)) return raw;
    return (raw as any)?.data ?? [];
  }, [data]);

  const rows = useMemo(() => (isLoading ? [] : flattenBrands(brands)), [brands, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "brand",
    entityLabel: "Brand",
    FormComponent: BrandForm,
    idProp: "brandId",
    editRoute: "/inventory/companies/:id",
    createRoute: "/inventory/companies/new",
  });

  return (
    <TableFull
      data={rows}
      title="Brands"
      tableKey="products-brands"
      columns={BRAND_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
