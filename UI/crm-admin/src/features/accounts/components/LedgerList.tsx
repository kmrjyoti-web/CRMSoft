"use client";

import { useMemo } from "react";

import { TableFull } from "@/components/ui";
import { useSidePanelStore } from "@/stores/side-panel.store";

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
  if (val == null) return "—";
  const n = Number(val);
  const abs = Math.abs(n);
  const formatted = `₹${abs.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  return n < 0 ? `(${formatted})` : formatted;
}

export function LedgerList() {
  const { data } = useLedgerList();
  const { openPanel, closePanel } = useSidePanelStore();

  const rows = useMemo(() => {
    const list = (data as any)?.data?.data ?? (data as any)?.data ?? [];
    return list.map((l: any) => {
      const gt = l.groupType ?? "ASSET";
      const color = GROUP_TYPE_COLOR[gt] ?? "#6b7280";
      return {
        id:          l.id,
        code:        l.code,
        name:        l.name,
        accountGroup:l.accountGroup?.name ?? l.subGroup ?? "—",
        groupType: (
          <span style={{
            padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
            background: color + "18", color,
          }}>
            {gt}
          </span>
        ),
        station:     l.station ?? "—",
        balance:     formatINR(l.currentBalance),
        gstin:       l.gstin ?? "—",
      };
    });
  }, [data]);

  function openCreatePanel() {
    const panelId = "create-ledger";
    openPanel({
      id:    panelId,
      title: "New Ledger",
      icon:  "book-open",
      width: 720,
      content: (
        <LedgerForm
          mode="panel"
          panelId={panelId}
          onSuccess={() => closePanel(panelId)}
        />
      ),
      footerButtons: [
        {
          id: "cancel", label: "Cancel", showAs: "text" as const, variant: "secondary" as const,
          onClick: () => useSidePanelStore.getState().closePanel(panelId),
        },
        {
          id: "save", label: "Create Ledger", icon: "check", showAs: "both" as const, variant: "primary" as const,
          onClick: () => {
            const f = document.getElementById("sp-form-ledger-new") as HTMLFormElement | null;
            f?.requestSubmit();
          },
        },
      ],
    });
  }

  function openEditPanel(row: any) {
    const panelId = `edit-ledger-${row.id}`;
    openPanel({
      id:    panelId,
      title: `Edit Ledger — ${row.name}`,
      icon:  "book-open",
      width: 720,
      content: (
        <LedgerForm
          mode="panel"
          panelId={panelId}
          ledgerId={row.id}
          onSuccess={() => closePanel(panelId)}
        />
      ),
      footerButtons: [
        {
          id: "cancel", label: "Cancel", showAs: "text" as const, variant: "secondary" as const,
          onClick: () => useSidePanelStore.getState().closePanel(panelId),
        },
        {
          id: "save", label: "Save Changes", icon: "check", showAs: "both" as const, variant: "primary" as const,
          onClick: () => {
            const f = document.getElementById(`sp-form-ledger-${row.id}`) as HTMLFormElement | null;
            f?.requestSubmit();
          },
        },
      ],
    });
  }

  return (
    <TableFull
      data={rows}
      title="Ledger Master"
      tableKey="accounts-ledger"
      columns={LEDGER_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={openEditPanel}
      onCreate={openCreatePanel}
    />
  );
}
