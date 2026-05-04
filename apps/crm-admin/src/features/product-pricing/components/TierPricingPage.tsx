"use client";

import { useState, useCallback } from "react";
import { Button, Icon, Input, NumberInput, Badge } from "@/components/ui";
import { usePriceList, useSetSlabPrices } from "../hooks/useProductPricing";
import toast from "react-hot-toast";

interface SlabRow {
  minQty: number;
  maxQty: number | null;
  pricePerUnit: number;
}

function SlabEditor({ productId }: { productId: string }) {
  const { data, isLoading } = usePriceList(productId);
  const setSlabsMut = useSetSlabPrices();

  const priceList = data?.data;

  const [slabRows, setSlabRows] = useState<SlabRow[]>(() =>
    priceList?.slabPrices?.map((s) => ({
      minQty: s.minQty,
      maxQty: s.maxQty ?? null,
      pricePerUnit: s.pricePerUnit,
    })) ?? [{ minQty: 1, maxQty: null, pricePerUnit: 0 }]
  );

  const updateRow = (index: number, field: keyof SlabRow, value: number | null) => {
    setSlabRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addRow = () => setSlabRows((prev) => [...prev, { minQty: 1, maxQty: null, pricePerUnit: 0 }]);
  const removeRow = (index: number) => setSlabRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = useCallback(async () => {
    try {
      await setSlabsMut.mutateAsync({
        productId,
        dto: {
          slabs: slabRows.map((s) => ({
            minQty: s.minQty,
            maxQty: s.maxQty ?? undefined,
            pricePerUnit: s.pricePerUnit,
          })),
        },
      });
      toast.success("Slab prices saved");
    } catch {
      toast.error("Failed to save slab prices");
    }
  }, [productId, slabRows, setSlabsMut]);

  if (isLoading) return <div style={{ color: "#6b7280", padding: 16 }}>Loading pricing data...</div>;

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Quantity Slabs</h3>
        <Badge variant="secondary">{slabRows.length} slab{slabRows.length !== 1 ? "s" : ""}</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 48px", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>Min Qty</span>
        <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>Max Qty</span>
        <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>Price / Unit (₹)</span>
        <span />
      </div>

      {slabRows.map((row, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 48px", gap: 12, alignItems: "center", marginBottom: 8 }}>
          <NumberInput label="Min Qty" value={row.minQty} onChange={(v) => updateRow(idx, "minQty", v)} leftIcon={<Icon name="hash" size={16} />} />
          <NumberInput label="Max Qty" value={row.maxQty} onChange={(v) => updateRow(idx, "maxQty", v)} leftIcon={<Icon name="hash" size={16} />} />
          <NumberInput label="Price/Unit" value={row.pricePerUnit} onChange={(v) => updateRow(idx, "pricePerUnit", v)} leftIcon={<Icon name="indian-rupee" size={16} />} />
          <Button variant="ghost" onClick={() => removeRow(idx)} disabled={slabRows.length <= 1}>
            <Icon name="trash-2" size={16} />
          </Button>
        </div>
      ))}

      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
        <Button variant="outline" onClick={addRow}>
          <Icon name="plus" size={16} /> Add Slab
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={setSlabsMut.isPending}>
          <Icon name="save" size={16} /> Save Slabs
        </Button>
      </div>
    </div>
  );
}

export function TierPricingPage() {
  const [inputId, setInputId] = useState("");
  const [productId, setProductId] = useState<string | null>(null);

  const handleLoad = useCallback(() => {
    const trimmed = inputId.trim();
    if (!trimmed) return;
    setProductId(trimmed);
  }, [inputId]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <Icon name="layers" size={24} />
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Tier / Slab Pricing</h1>
      </div>
      <p style={{ color: "#6b7280", marginBottom: 24, marginTop: -12 }}>
        Set quantity-based slab pricing for a product. Different prices apply for different quantity ranges.
      </p>

      <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Enter Product ID"
              value={inputId}
              onChange={setInputId}
              leftIcon={<Icon name="package" size={16} />}
            />
          </div>
          <Button variant="primary" onClick={handleLoad} disabled={!inputId.trim()}>
            <Icon name="search" size={16} /> Load
          </Button>
        </div>
      </div>

      {productId && <SlabEditor productId={productId} />}
    </div>
  );
}
