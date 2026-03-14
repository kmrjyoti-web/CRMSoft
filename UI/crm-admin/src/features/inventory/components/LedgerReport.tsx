"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge, Button, Icon, Input } from "@/components/ui";
import { useLedgerReport } from "../hooks/useInventory";
import type { LedgerEntry } from "../types/inventory.types";

// ── Column definitions ──────────────────────────────────

const LEDGER_COLUMNS = [
  { id: "date", label: "Date", visible: true },
  { id: "type", label: "Type", visible: true },
  { id: "inQty", label: "In", visible: true },
  { id: "outQty", label: "Out", visible: true },
  { id: "balance", label: "Balance", visible: true },
  { id: "unitPrice", label: "Unit Price", visible: true },
  { id: "totalAmount", label: "Total", visible: true },
  { id: "remarks", label: "Remarks", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function flattenLedger(entries: LedgerEntry[]): Record<string, any>[] {
  return entries.map((e) => ({
    id: e.id,
    date: new Date(e.date).toLocaleDateString(),
    type: <Badge variant="secondary">{e.type.replace("_", " ")}</Badge>,
    inQty: (
      <span style={{ color: "#2eb85c", fontWeight: e.inQty > 0 ? 600 : 400 }}>
        {e.inQty > 0 ? `+${e.inQty}` : "—"}
      </span>
    ),
    outQty: (
      <span style={{ color: "#e55353", fontWeight: e.outQty > 0 ? 600 : 400 }}>
        {e.outQty > 0 ? `-${e.outQty}` : "—"}
      </span>
    ),
    balance: <span style={{ fontWeight: 600 }}>{e.balance}</span>,
    unitPrice: e.unitPrice ? `₹${Number(e.unitPrice).toFixed(2)}` : "—",
    totalAmount: e.totalAmount ? `₹${Number(e.totalAmount).toFixed(2)}` : "—",
    remarks: e.remarks ?? "—",
  }));
}

// ── Component ───────────────────────────────────────────

export function LedgerReport() {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const params: Record<string, any> = {};
  if (productId) params.productId = productId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const { data, isLoading } = useLedgerReport(Object.keys(params).length > 0 ? params : undefined);
  const entries: LedgerEntry[] = (data?.data ?? []) as LedgerEntry[];

  const rows = useMemo(() => (isLoading ? [] : flattenLedger(entries)), [entries, isLoading]);

  return (
    <TableFull
      data={rows}
      title="Stock Ledger Report"
      tableKey="inventory-ledger"
      columns={LEDGER_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      headerActions={
        <div className="d-flex gap-2 align-items-center">
          <div style={{ width: 200 }}>
            <Input label="Product ID" value={productId} onChange={setProductId} leftIcon={<Icon name="package" size={16} />} />
          </div>
          <div style={{ width: 140 }}>
            <Input label="Start Date" value={startDate} onChange={setStartDate} leftIcon={<Icon name="calendar" size={16} />} />
          </div>
          <div style={{ width: 140 }}>
            <Input label="End Date" value={endDate} onChange={setEndDate} leftIcon={<Icon name="calendar" size={16} />} />
          </div>
          <Button variant="ghost" onClick={() => router.push("/inventory/reports")}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        </div>
      }
    />
  );
}
