"use client";

import { useMemo } from "react";

import { TableFull } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";

import { useLedgerList } from "../hooks/useAccounts";
import { LedgerForm } from "./LedgerForm";

const LEDGER_COLUMNS = [
  { id: "code",        label: "Code",         visible: true },
  { id: "name",        label: "Name",         visible: true },
  { id: "accountGroup",label: "Account Group",visible: true },
  { id: "groupType",   label: "Type",         visible: true },
  { id: "station",     label: "Station",      visible: true },
  { id: "balance",     label: "Balance",      visible: true },
  { id: "gstin",       label: "GSTIN",        visible: false },
];

const GROUP_TYPE_COLOR: Record<string, string> = {
  ASSET:     "#16a34a",
  LIABILITY: "#dc2626",
  EQUITY:    "#7c3aed",
  INCOME:    "#0891b2",
  EXPENSE:   "#ea580c",
};

function formatINR(val: any) {
  if (val == null) return "\u2014";
  const n = Number(val);
  const abs = Math.abs(n);
  const formatted = `\u20B9${abs.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  return n < 0 ? `(${formatted})` : formatted;
}

export function LedgerList() {
  const { data } = useLedgerList();

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "ledger",
    entityLabel: "Ledger",
    FormComponent: LedgerForm,
    idProp: "ledgerId",
    editRoute: "/accounts/ledgers/:id/edit",
    createRoute: "/accounts/ledgers/new",
    displayField: "name",
    panelWidth: 720,
  });

  const rows = useMemo(() => {
    const list = (data as any)?.data?.data ?? (data as any)?.data ?? [];
    return list.map((l: any) => {
      const gt = l.groupType ?? "ASSET";
      const color = GROUP_TYPE_COLOR[gt] ?? "#6b7280";
      return {
        id:          l.id,
        code:        l.code,
        name:        l.name,
        accountGroup:l.accountGroup?.name ?? l.subGroup ?? "\u2014",
        groupType: (
          <span style={{
            padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
            background: color + "18", color,
          }}>
            {gt}
          </span>
        ),
        station:     l.station ?? "\u2014",
        balance:     formatINR(l.currentBalance),
        gstin:       l.gstin ?? "\u2014",
      };
    });
  }, [data]);

  return (
    <TableFull
      data={rows}
      title="Ledger Master"
      tableKey="accounts-ledger"
      columns={LEDGER_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
