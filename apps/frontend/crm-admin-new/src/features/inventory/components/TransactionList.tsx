"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge } from "@/components/ui";
import { useTransactionList } from "../hooks/useInventory";
import type { StockTransaction } from "../types/inventory.types";

// ── Column definitions ──────────────────────────────────

const TXN_COLUMNS = [
  { id: "transactionDate", label: "Date", visible: true },
  { id: "transactionType", label: "Type", visible: true },
  { id: "productId", label: "Product", visible: true },
  { id: "quantity", label: "Qty", visible: true },
  { id: "unitPrice", label: "Unit Price", visible: true },
  { id: "totalAmount", label: "Total", visible: true },
  { id: "locationId", label: "Location", visible: true },
  { id: "remarks", label: "Remarks", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function getTxnBadge(type: string): { variant: any; label: string } {
  const map: Record<string, { variant: any; label: string }> = {
    PURCHASE_IN: { variant: "success", label: "Purchase In" },
    SALE_OUT: { variant: "primary", label: "Sale Out" },
    RETURN_IN: { variant: "warning", label: "Return In" },
    TRANSFER: { variant: "secondary", label: "Transfer" },
    ADJUSTMENT: { variant: "warning", label: "Adjustment" },
    OPENING_BALANCE: { variant: "secondary", label: "Opening" },
    DAMAGE: { variant: "danger", label: "Damage" },
    WRITE_OFF: { variant: "danger", label: "Write Off" },
  };
  return map[type] ?? { variant: "secondary", label: type };
}

function flattenTransactions(txns: StockTransaction[]): Record<string, unknown>[] {
  return txns.map((txn) => {
    const badge = getTxnBadge(txn.transactionType);
    return {
      id: txn.id,
      transactionDate: new Date(txn.transactionDate).toLocaleDateString(),
      transactionType: (
        <Badge variant={badge.variant}>{badge.label}</Badge>
      ),
      productId: txn.productId.slice(0, 8) + "...",
      quantity: (
        <span style={{ fontWeight: 600, color: txn.quantity > 0 ? "#2eb85c" : "#e55353" }}>
          {txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity}
        </span>
      ),
      unitPrice: txn.unitPrice ? `₹${Number(txn.unitPrice).toFixed(2)}` : "—",
      totalAmount: txn.totalAmount ? `₹${Number(txn.totalAmount).toFixed(2)}` : "—",
      locationId: txn.locationId?.slice(0, 8) ?? "—",
      remarks: txn.remarks ?? "—",
    };
  });
}

// ── Component ───────────────────────────────────────────

export function TransactionList() {
  const router = useRouter();
  const { data, isLoading } = useTransactionList();
  const transactions: StockTransaction[] = (data?.data ?? []) as StockTransaction[];

  const rows = useMemo(() => (isLoading ? [] : flattenTransactions(transactions)), [transactions, isLoading]);

  const handleCreate = useCallback(() => {
    router.push("/inventory/transactions/new");
  }, [router]);

  return (
    <TableFull
      data={rows}
      title="Stock Transactions"
      tableKey="inventory-transactions"
      columns={TXN_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onCreate={handleCreate}
    />
  );
}
