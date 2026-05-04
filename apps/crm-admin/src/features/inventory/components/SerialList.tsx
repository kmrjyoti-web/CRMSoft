"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge, Button, Icon } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useSerialList } from "../hooks/useInventory";
import { SerialForm } from "./SerialForm";
import type { SerialMaster } from "../types/inventory.types";

// ── Column definitions ──────────────────────────────────

const SERIAL_COLUMNS = [
  { id: "serialNo", label: "Serial No", visible: true },
  { id: "code1", label: "Code 1", visible: true },
  { id: "code2", label: "Code 2", visible: true },
  { id: "batchNo", label: "Batch", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "expiryDate", label: "Expiry", visible: true },
  { id: "mrp", label: "MRP", visible: true },
  { id: "costPrice", label: "Cost", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, "primary" | "success" | "warning" | "secondary" | "danger"> = {
    AVAILABLE: "success", SOLD: "primary", RESERVED: "warning",
    EXPIRED: "danger", DAMAGED: "danger", RETURNED: "secondary",
    ACTIVATED: "success", DEACTIVATED: "secondary",
  };
  return map[status] ?? "secondary";
}

function flattenSerials(serials: SerialMaster[]): Record<string, unknown>[] {
  return serials.map((s) => ({
    id: s.id,
    serialNo: s.serialNo,
    code1: s.code1 ?? "—",
    code2: s.code2 ?? "—",
    batchNo: s.batchNo ?? "—",
    status: (
      <Badge variant={getStatusVariant(s.status)}>{s.status}</Badge>
    ),
    expiryDate: s.expiryDate
      ? new Date(s.expiryDate).toLocaleDateString()
      : s.expiryType === "NEVER" ? "Never" : "—",
    mrp: s.mrp ? `₹${Number(s.mrp).toFixed(2)}` : "—",
    costPrice: s.costPrice ? `₹${Number(s.costPrice).toFixed(2)}` : "—",
  }));
}

// ── Component ───────────────────────────────────────────

export function SerialList() {
  const router = useRouter();
  const { data, isLoading } = useSerialList();
  const serials: SerialMaster[] = (data?.data ?? []) as SerialMaster[];

  const rows = useMemo(() => (isLoading ? [] : flattenSerials(serials)), [serials, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "serial",
    entityLabel: "Serial Number",
    FormComponent: SerialForm,
    idProp: "serialId",
    editRoute: "/inventory/serials/:id/edit",
    createRoute: "/inventory/serials/new",
    displayField: "serialNo",
    panelWidth: 700,
  });

  return (
    <TableFull
      data={rows as Record<string, unknown>[]}
      title="Serial Numbers"
      tableKey="inventory-serials"
      columns={SERIAL_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
      headerActions={
        <Button variant="outline" onClick={() => router.push("/inventory/serials/bulk-import")}>
          <Icon name="upload" size={14} /> Bulk Import
        </Button>
      }
    />
  );
}
