"use client";

import { useMemo } from "react";

import { TableFull, Badge } from "@/components/ui";

import { useLedgerMappingList } from "../hooks/useAccounts";

const COLUMNS = [
  { id: "entityType", label: "Entity Type", visible: true },
  { id: "entityName", label: "Entity Name", visible: true },
  { id: "ledgerName", label: "Ledger",      visible: true },
  { id: "gstin",      label: "GSTIN",       visible: true },
  { id: "pan",        label: "PAN",         visible: false },
];

const ENTITY_VARIANT: Record<string, "primary" | "success" | "warning" | "secondary" | "danger"> = {
  CONTACT:      "primary",
  ORGANIZATION: "success",
};

export function LedgerMappingList() {
  const { data } = useLedgerMappingList();

  const rows = useMemo(() => {
    const list = (data as any)?.data?.data ?? (data as any)?.data ?? [];
    return list.map((m: any) => ({
      id:         m.id,
      entityType: (
        <Badge variant={ENTITY_VARIANT[m.entityType] ?? "secondary"}>
          {m.entityType ?? "—"}
        </Badge>
      ),
      entityName: m.entityName ?? "—",
      ledgerName: m.ledger?.name ?? m.ledgerId ?? "—",
      gstin:      m.gstin ?? "—",
      pan:        m.pan   ?? "—",
    }));
  }, [data]);

  return (
    <TableFull
      data={rows}
      title="Ledger Mappings"
      tableKey="accounts-ledger-mappings"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
    />
  );
}
