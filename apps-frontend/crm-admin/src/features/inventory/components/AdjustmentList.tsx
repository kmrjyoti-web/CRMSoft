"use client";

import { useMemo, useState } from "react";
import { TableFull, Badge, Button, Icon, Card, Input, SelectInput } from "@/components/ui";
import { useAdjustmentList, useCreateAdjustment, useApproveAdjustment } from "../hooks/useInventory";
import type { StockAdjustment } from "../types/inventory.types";

// ── Column definitions ──────────────────────────────────

const ADJUSTMENT_COLUMNS = [
  { id: "createdAt", label: "Date", visible: true },
  { id: "adjustmentType", label: "Type", visible: true },
  { id: "productId", label: "Product", visible: true },
  { id: "quantity", label: "Qty", visible: true },
  { id: "reason", label: "Reason", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "actions", label: "Actions", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, "primary" | "success" | "warning" | "secondary" | "danger"> = {
    ADJ_PENDING: "warning",
    ADJ_APPROVED: "success",
    ADJ_REJECTED: "danger",
  };
  return map[status] ?? "secondary";
}

function statusLabel(status: string): string {
  return status.replace("ADJ_", "");
}

// ── Component ───────────────────────────────────────────

export function AdjustmentList() {
  const { data, isLoading } = useAdjustmentList();
  const createAdj = useCreateAdjustment();
  const approveAdj = useApproveAdjustment();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    productId: "", locationId: "", adjustmentType: "INCREASE", quantity: "", reason: "",
  });

  const adjustments: StockAdjustment[] = (data?.data ?? []) as unknown as StockAdjustment[];
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const rows = useMemo(() => {
    if (isLoading) return [];
    return adjustments.map((adj) => ({
      id: adj.id,
      createdAt: new Date(adj.createdAt).toLocaleDateString(),
      adjustmentType: <Badge variant="secondary">{adj.adjustmentType}</Badge>,
      productId: adj.productId.slice(0, 8) + "...",
      quantity: <span style={{ fontWeight: 600 }}>{adj.quantity}</span>,
      reason: adj.reason,
      status: (
        <Badge variant={getStatusVariant(adj.status)}>
          {statusLabel(adj.status)}
        </Badge>
      ),
      actions: adj.status === "ADJ_PENDING" ? (
        <div className="d-flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              approveAdj.mutate({ id: adj.id, action: "approve" });
            }}
            disabled={approveAdj.isPending}
          >
            <Icon name="check" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              approveAdj.mutate({ id: adj.id, action: "reject" });
            }}
            disabled={approveAdj.isPending}
          >
            <Icon name="x" size={14} />
          </Button>
        </div>
      ) : null,
    }));
  }, [adjustments, isLoading, approveAdj]);

  async function handleFormCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId || !form.locationId || !form.quantity || !form.reason) return;
    await createAdj.mutateAsync({
      productId: form.productId,
      locationId: form.locationId,
      adjustmentType: form.adjustmentType,
      quantity: parseInt(form.quantity),
      reason: form.reason,
    });
    setForm({ productId: "", locationId: "", adjustmentType: "INCREASE", quantity: "", reason: "" });
    setShowForm(false);
  }

  return (
    <div>
      {showForm && (
        <Card className="mb-4 mx-6 mt-4">
          <form className="p-4" onSubmit={handleFormCreate}>
            <h6 style={{ fontWeight: 600 }} className="mb-3">New Adjustment</h6>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Input label="Product ID" value={form.productId} onChange={(v) => set("productId", v)} leftIcon={<Icon name="package" size={16} />} />
              <Input label="Location ID" value={form.locationId} onChange={(v) => set("locationId", v)} leftIcon={<Icon name="map-pin" size={16} />} />
              <SelectInput
                label="Type"
                value={form.adjustmentType}
                options={[
                  { value: "INCREASE", label: "Increase" },
                  { value: "DECREASE", label: "Decrease" },
                  { value: "WRITE_OFF", label: "Write Off" },
                ]}
                onChange={(v) => set("adjustmentType", String(v ?? "INCREASE"))}
              />
              <Input label="Quantity" value={form.quantity} onChange={(v) => set("quantity", v)} leftIcon={<Icon name="hash" size={16} />} />
              <Input label="Reason" value={form.reason} onChange={(v) => set("reason", v)} leftIcon={<Icon name="edit" size={16} />} />
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={createAdj.isPending}>
                {createAdj.isPending ? "Creating..." : "Submit Adjustment"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <TableFull
        data={rows as Record<string, unknown>[]}
        title="Stock Adjustments"
        tableKey="inventory-adjustments"
        columns={ADJUSTMENT_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        onCreate={() => setShowForm(!showForm)}
      />
    </div>
  );
}
