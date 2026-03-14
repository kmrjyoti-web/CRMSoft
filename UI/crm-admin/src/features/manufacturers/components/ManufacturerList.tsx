"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useManufacturers } from "../hooks/useManufacturers";
import { ManufacturerForm } from "./ManufacturerForm";
import type { Manufacturer } from "../types/manufacturers.types";

const MANUFACTURER_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "code", label: "Code", visible: true },
  { id: "country", label: "Country", visible: true },
  { id: "description", label: "Description", visible: true },
  { id: "website", label: "Website", visible: true },
  { id: "status", label: "Status", visible: true },
];

function flattenManufacturers(manufacturers: Manufacturer[]): Record<string, any>[] {
  return manufacturers.map((m) => ({
    id: m.id,
    name: <span style={{ fontWeight: 600 }}>{m.name}</span>,
    code: <Badge variant="outline">{m.code}</Badge>,
    country: m.country ?? "—",
    description: m.description ?? "—",
    website: m.website ?? "—",
    status: <Badge variant={m.isActive ? "success" : "secondary"}>{m.isActive ? "Active" : "Inactive"}</Badge>,
  }));
}

export function ManufacturerList() {
  const { data, isLoading } = useManufacturers({});
  const manufacturers: Manufacturer[] = useMemo(() => {
    const raw = data?.data;
    if (Array.isArray(raw)) return raw;
    return (raw as any)?.data ?? [];
  }, [data]);

  const rows = useMemo(() => (isLoading ? [] : flattenManufacturers(manufacturers)), [manufacturers, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "manufacturer",
    entityLabel: "Manufacturer",
    FormComponent: ManufacturerForm,
    idProp: "manufacturerId",
    editRoute: "/products/manufacturers/:id",
    createRoute: "/products/manufacturers/new",
  });

  return (
    <TableFull
      data={rows}
      title="Manufacturers"
      tableKey="products-manufacturers"
      columns={MANUFACTURER_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
