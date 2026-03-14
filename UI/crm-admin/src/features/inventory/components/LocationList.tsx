"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useLocationList } from "../hooks/useInventory";
import { LocationForm } from "./LocationForm";
import type { StockLocation } from "../types/inventory.types";

// ── Column definitions ──────────────────────────────────

const LOCATION_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "code", label: "Code", visible: true },
  { id: "type", label: "Type", visible: true },
  { id: "address", label: "Address", visible: true },
  { id: "city", label: "City", visible: true },
  { id: "contactPerson", label: "Contact", visible: true },
  { id: "phone", label: "Phone", visible: true },
  { id: "status", label: "Status", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function flattenLocations(locations: StockLocation[]): Record<string, any>[] {
  return locations.map((loc) => ({
    id: loc.id,
    name: (
      <span className="d-flex align-items-center gap-2">
        <span style={{ fontWeight: 600 }}>{loc.name}</span>
        {loc.isDefault && <Badge variant="success">Default</Badge>}
      </span>
    ),
    code: loc.code,
    type: loc.type,
    address: loc.address ?? "—",
    city: loc.city ?? "—",
    contactPerson: loc.contactPerson ?? "—",
    phone: loc.phone ?? "—",
    status: (
      <Badge variant={loc.isActive ? "primary" : "secondary"}>
        {loc.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  }));
}

// ── Component ───────────────────────────────────────────

export function LocationList() {
  const { data, isLoading } = useLocationList();
  const locations: StockLocation[] = (data?.data ?? []) as StockLocation[];
  const rows = useMemo(() => (isLoading ? [] : flattenLocations(locations)), [locations, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "location",
    entityLabel: "Location",
    FormComponent: LocationForm,
    idProp: "locationId",
    editRoute: "/inventory/stores/:id/edit",
    createRoute: "/inventory/stores/new",
  });

  return (
    <TableFull
      data={rows}
      title="Stock Locations / Warehouses"
      tableKey="inventory-locations"
      columns={LOCATION_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
