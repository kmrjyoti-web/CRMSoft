"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Button, Card, Input, SelectInput } from "@/components/ui";
import { useRecordTransaction, useStockTransfer } from "../hooks/useInventory";

const TXN_TYPES = [
  { value: "PURCHASE_IN", label: "Purchase In" },
  { value: "SALE_OUT", label: "Sale Out" },
  { value: "RETURN_IN", label: "Return In" },
  { value: "OPENING_BALANCE", label: "Opening Balance" },
  { value: "DAMAGE", label: "Damage" },
  { value: "WRITE_OFF", label: "Write Off" },
];

export function TransactionForm() {
  const router = useRouter();
  const recordTxn = useRecordTransaction();
  const transferStock = useStockTransfer();

  const [mode, setMode] = useState<"transaction" | "transfer">("transaction");
  const [form, setForm] = useState({
    productId: "",
    transactionType: "PURCHASE_IN",
    quantity: "",
    locationId: "",
    toLocationId: "",
    unitPrice: "",
    remarks: "",
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "transfer") {
      await transferStock.mutateAsync({
        productId: form.productId,
        quantity: parseInt(form.quantity),
        fromLocationId: form.locationId,
        toLocationId: form.toLocationId,
        unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : undefined,
        remarks: form.remarks || undefined,
      });
    } else {
      await recordTxn.mutateAsync({
        productId: form.productId,
        transactionType: form.transactionType,
        quantity: parseInt(form.quantity),
        locationId: form.locationId,
        unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : undefined,
        remarks: form.remarks || undefined,
      });
    }
    router.push("/inventory/transactions");
  }

  const isPending = recordTxn.isPending || transferStock.isPending;

  return (
    <div className="p-6">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <Icon name="arrow-left" size={18} />
        </Button>
        <h4 className="mb-0" style={{ fontWeight: 600 }}>Record Stock Movement</h4>
      </div>

      <div className="d-flex gap-2 mb-4">
        <Button
          variant={mode === "transaction" ? "primary" : "outline"}
          onClick={() => setMode("transaction")}
        >
          <Icon name="arrow-down" size={14} /> Stock In/Out
        </Button>
        <Button
          variant={mode === "transfer" ? "primary" : "outline"}
          onClick={() => setMode("transfer")}
        >
          <Icon name="arrow-left-right" size={14} /> Transfer
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input
                label="Product ID"
                value={form.productId}
                onChange={(v) => set("productId", v)}
                leftIcon={<Icon name="package" size={16} />}
              />
              <Input
                label="Quantity"
                value={form.quantity}
                onChange={(v) => set("quantity", v)}
                leftIcon={<Icon name="hash" size={16} />}
              />
              {mode === "transaction" && (
                <SelectInput
                  label="Transaction Type"
                  value={form.transactionType}
                  options={TXN_TYPES}
                  onChange={(v) => set("transactionType", String(v ?? "PURCHASE_IN"))}
                />
              )}
              <Input
                label={mode === "transfer" ? "From Location ID" : "Location ID"}
                value={form.locationId}
                onChange={(v) => set("locationId", v)}
                leftIcon={<Icon name="map-pin" size={16} />}
              />
              {mode === "transfer" && (
                <Input
                  label="To Location ID"
                  value={form.toLocationId}
                  onChange={(v) => set("toLocationId", v)}
                  leftIcon={<Icon name="map-pin" size={16} />}
                />
              )}
              <Input
                label="Unit Price"
                value={form.unitPrice}
                onChange={(v) => set("unitPrice", v)}
                leftIcon={<Icon name="indian-rupee" size={16} />}
              />
              <Input
                label="Remarks"
                value={form.remarks}
                onChange={(v) => set("remarks", v)}
                leftIcon={<Icon name="edit" size={16} />}
              />
            </div>
          </div>
        </Card>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isPending || !form.productId || !form.quantity || !form.locationId}>
            {isPending ? "Recording..." : mode === "transfer" ? "Transfer Stock" : "Record Transaction"}
          </Button>
        </div>
      </form>
    </div>
  );
}
