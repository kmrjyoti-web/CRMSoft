"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge, Button, Icon, SelectInput } from "@/components/ui";
import { useExpiryReport } from "../hooks/useInventory";
import type { ExpiryReportItem } from "../types/inventory.types";

// ── Column definitions ──────────────────────────────────

const EXPIRY_COLUMNS = [
  { id: "serialNo", label: "Serial No", visible: true },
  { id: "productId", label: "Product", visible: true },
  { id: "expiryDate", label: "Expiry Date", visible: true },
  { id: "daysLeft", label: "Days Left", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "costPrice", label: "Cost", visible: true },
];

const DAYS_OPTIONS = [
  { value: "30", label: "Next 30 days" },
  { value: "60", label: "Next 60 days" },
  { value: "90", label: "Next 90 days" },
  { value: "180", label: "Next 180 days" },
  { value: "365", label: "Next 1 year" },
];

// ── Helpers ─────────────────────────────────────────────

function flattenExpiry(items: ExpiryReportItem[]): Record<string, any>[] {
  return items.map((item) => ({
    id: item.id,
    serialNo: <span style={{ fontWeight: 600 }}>{item.serialNo}</span>,
    productId: item.productId.slice(0, 8) + "...",
    expiryDate: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—",
    daysLeft: (
      <Badge variant={item.isExpired ? "danger" : (item.daysLeft ?? 999) <= 7 ? "warning" : "secondary"}>
        {item.isExpired ? "EXPIRED" : `${item.daysLeft} days`}
      </Badge>
    ),
    status: <Badge variant="secondary">{item.status}</Badge>,
    costPrice: item.costPrice ? `₹${Number(item.costPrice).toFixed(2)}` : "—",
  }));
}

// ── Component ───────────────────────────────────────────

export function ExpiryReport() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const { data, isLoading } = useExpiryReport(days);
  const items: ExpiryReportItem[] = (data?.data ?? []) as ExpiryReportItem[];

  const rows = useMemo(() => (isLoading ? [] : flattenExpiry(items)), [items, isLoading]);

  return (
    <TableFull
      data={rows}
      title="Expiry Report"
      tableKey="inventory-expiry"
      columns={EXPIRY_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      headerActions={
        <div className="d-flex gap-2 align-items-center">
          <div style={{ width: 180 }}>
            <SelectInput
              label="Time Range"
              value={String(days)}
              options={DAYS_OPTIONS}
              onChange={(v) => setDays(parseInt(String(v ?? "30")))}
            />
          </div>
          <Badge variant={items.length > 0 ? "warning" : "success"}>
            {items.length} items expiring
          </Badge>
          <Button variant="ghost" onClick={() => router.push("/inventory/reports")}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        </div>
      }
    />
  );
}
