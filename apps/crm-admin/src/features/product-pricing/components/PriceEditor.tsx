"use client";

import { useState, useCallback } from "react";

import toast from "react-hot-toast";

import { Button, Icon, NumberInput, Input, SelectInput, Badge } from "@/components/ui";

import {
  usePriceList,
  useSetPrices,
  useSetSlabPrices,
  useSetGroupPrice,
} from "../hooks/useProductPricing";

import type {
  PriceType,
  SlabPrice,
  GroupPrice,
} from "../types/product-pricing.types";

// ── Constants ────────────────────────────────────────────

const PRICE_TYPES: PriceType[] = [
  "BASE",
  "MRP",
  "SELLING",
  "WHOLESALE",
  "DISTRIBUTOR",
  "SPECIAL",
];

const PRICE_TYPE_OPTIONS = PRICE_TYPES.map((t) => ({ label: t, value: t }));

interface PriceRow {
  priceType: PriceType;
  amount: number;
  currency: string;
}

interface SlabRow {
  minQty: number;
  maxQty: number | null;
  pricePerUnit: number;
}

interface GroupRow {
  groupId: string;
  priceType: PriceType;
  amount: number;
}

// ── Props ────────────────────────────────────────────────

interface PriceEditorProps {
  productId: string;
}

// ── Component ────────────────────────────────────────────

export function PriceEditor({ productId }: PriceEditorProps) {
  const { data, isLoading } = usePriceList(productId);
  const setPricesMut = useSetPrices();
  const setSlabsMut = useSetSlabPrices();
  const setGroupMut = useSetGroupPrice();

  const priceList = data?.data;

  // ── Section collapse state ────────────────────────────

  const [basePricesOpen, setBasePricesOpen] = useState(true);
  const [slabsOpen, setSlabsOpen] = useState(true);
  const [groupOpen, setGroupOpen] = useState(true);

  // ── Base prices state ─────────────────────────────────

  const [basePrices, setBasePrices] = useState<PriceRow[]>(() =>
    PRICE_TYPES.map((t) => {
      const existing = priceList?.prices?.find((p) => p.priceType === t);
      return {
        priceType: t,
        amount: existing?.amount ?? 0,
        currency: existing?.currency ?? "INR",
      };
    })
  );

  // Sync base prices when data loads
  const syncBasePrices = useCallback(() => {
    if (!priceList) return;
    setBasePrices(
      PRICE_TYPES.map((t) => {
        const existing = priceList.prices?.find((p) => p.priceType === t);
        return {
          priceType: t,
          amount: existing?.amount ?? 0,
          currency: existing?.currency ?? "INR",
        };
      })
    );
  }, [priceList]);

  // ── Slab prices state ─────────────────────────────────

  const [slabRows, setSlabRows] = useState<SlabRow[]>(() =>
    priceList?.slabPrices?.map((s) => ({
      minQty: s.minQty,
      maxQty: s.maxQty ?? null,
      pricePerUnit: s.pricePerUnit,
    })) ?? [{ minQty: 1, maxQty: null, pricePerUnit: 0 }]
  );

  // ── Group prices state ────────────────────────────────

  const [groupRows, setGroupRows] = useState<GroupRow[]>(() =>
    priceList?.groupPrices?.map((g) => ({
      groupId: g.groupId,
      priceType: g.priceType,
      amount: g.amount,
    })) ?? [{ groupId: "", priceType: "SELLING" as PriceType, amount: 0 }]
  );

  // ── Base prices handlers ──────────────────────────────

  const updateBasePrice = useCallback(
    (index: number, field: keyof PriceRow, value: string | number | null) => {
      setBasePrices((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value ?? 0 };
        return updated;
      });
    },
    []
  );

  const handleSaveBasePrices = useCallback(async () => {
    try {
      await setPricesMut.mutateAsync({
        productId,
        dto: {
          prices: basePrices.map((p) => ({
            priceType: p.priceType,
            amount: p.amount,
            currency: p.currency,
          })),
        },
      });
      toast.success("Base prices saved successfully");
    } catch {
      toast.error("Failed to save base prices");
    }
  }, [productId, basePrices, setPricesMut]);

  // ── Slab prices handlers ──────────────────────────────

  const updateSlabRow = useCallback(
    (index: number, field: keyof SlabRow, value: number | null) => {
      setSlabRows((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const addSlabRow = useCallback(() => {
    setSlabRows((prev) => [...prev, { minQty: 1, maxQty: null, pricePerUnit: 0 }]);
  }, []);

  const removeSlabRow = useCallback((index: number) => {
    setSlabRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveSlabs = useCallback(async () => {
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
      toast.success("Slab prices saved successfully");
    } catch {
      toast.error("Failed to save slab prices");
    }
  }, [productId, slabRows, setSlabsMut]);

  // ── Group prices handlers ─────────────────────────────

  const updateGroupRow = useCallback(
    (index: number, field: keyof GroupRow, value: string | number | null) => {
      setGroupRows((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value as any };
        return updated;
      });
    },
    []
  );

  const addGroupRow = useCallback(() => {
    setGroupRows((prev) => [
      ...prev,
      { groupId: "", priceType: "SELLING" as PriceType, amount: 0 },
    ]);
  }, []);

  const removeGroupRow = useCallback((index: number) => {
    setGroupRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveGroupPrice = useCallback(
    async (row: GroupRow) => {
      if (!row.groupId) {
        toast.error("Group ID is required");
        return;
      }
      try {
        await setGroupMut.mutateAsync({
          productId,
          dto: {
            groupId: row.groupId,
            priceType: row.priceType,
            amount: row.amount,
          },
        });
        toast.success("Group price saved successfully");
      } catch {
        toast.error("Failed to save group price");
      }
    },
    [productId, setGroupMut]
  );

  // ── Render ────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
        Loading pricing data...
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #e5e7eb",
    marginBottom: 16,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    marginBottom: 12,
  };

  return (
    <div>
      {/* ── Base Prices ─────────────────────────────────── */}
      <div style={cardStyle}>
        <div
          style={sectionHeaderStyle}
          onClick={() => setBasePricesOpen(!basePricesOpen)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon
              name={basePricesOpen ? "chevron-down" : "chevron-right"}
              size={18}
            />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Base Prices
            </h3>
          </div>
          <Badge variant="secondary">{basePrices.length} types</Badge>
        </div>

        {basePricesOpen && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr 120px",
                gap: 12,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>
                Price Type
              </span>
              <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>
                Amount
              </span>
              <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>
                Currency
              </span>
            </div>

            {basePrices.map((row, idx) => (
              <div
                key={row.priceType}
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr 120px",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Badge variant="outline">{row.priceType}</Badge>
                <NumberInput
                  label="Amount"
                  value={row.amount}
                  onChange={(v) => updateBasePrice(idx, "amount", v)}
                  leftIcon={<Icon name="indian-rupee" size={16} />}
                />
                <Input
                  label="Currency"
                  value={row.currency}
                  onChange={(v) => updateBasePrice(idx, "currency", v)}
                  leftIcon={<Icon name="banknote" size={16} />}
                />
              </div>
            ))}

            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="primary"
                onClick={handleSaveBasePrices}
                disabled={setPricesMut.isPending}
              >
                <Icon name="save" size={16} />
                Save Prices
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ── Slab Pricing ────────────────────────────────── */}
      <div style={cardStyle}>
        <div
          style={sectionHeaderStyle}
          onClick={() => setSlabsOpen(!slabsOpen)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon
              name={slabsOpen ? "chevron-down" : "chevron-right"}
              size={18}
            />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Slab Pricing
            </h3>
          </div>
          <Badge variant="secondary">{slabRows.length} slabs</Badge>
        </div>

        {slabsOpen && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 48px",
                gap: 12,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>
                Min Qty
              </span>
              <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>
                Max Qty
              </span>
              <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>
                Price/Unit
              </span>
              <span />
            </div>

            {slabRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 48px",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <NumberInput
                  label="Min Qty"
                  value={row.minQty}
                  onChange={(v) => updateSlabRow(idx, "minQty", v)}
                  leftIcon={<Icon name="hash" size={16} />}
                />
                <NumberInput
                  label="Max Qty"
                  value={row.maxQty}
                  onChange={(v) => updateSlabRow(idx, "maxQty", v)}
                  leftIcon={<Icon name="hash" size={16} />}
                />
                <NumberInput
                  label="Price/Unit"
                  value={row.pricePerUnit}
                  onChange={(v) => updateSlabRow(idx, "pricePerUnit", v)}
                  leftIcon={<Icon name="indian-rupee" size={16} />}
                />
                <Button
                  variant="ghost"
                  onClick={() => removeSlabRow(idx)}
                  disabled={slabRows.length <= 1}
                >
                  <Icon name="trash-2" size={16} />
                </Button>
              </div>
            ))}

            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button variant="outline" onClick={addSlabRow}>
                <Icon name="plus" size={16} />
                Add Slab
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveSlabs}
                disabled={setSlabsMut.isPending}
              >
                <Icon name="save" size={16} />
                Save Slabs
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ── Group Pricing ───────────────────────────────── */}
      <div style={cardStyle}>
        <div
          style={sectionHeaderStyle}
          onClick={() => setGroupOpen(!groupOpen)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon
              name={groupOpen ? "chevron-down" : "chevron-right"}
              size={18}
            />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Group Pricing
            </h3>
          </div>
          <Badge variant="secondary">{groupRows.length} groups</Badge>
        </div>

        {groupOpen && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 1fr 80px 48px",
                gap: 12,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>
                Group ID
              </span>
              <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>
                Price Type
              </span>
              <span style={{ fontWeight: 500, fontSize: 13, color: "#6b7280" }}>
                Amount
              </span>
              <span />
              <span />
            </div>

            {groupRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 160px 1fr 80px 48px",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Input
                  label="Group ID"
                  value={row.groupId}
                  onChange={(v) => updateGroupRow(idx, "groupId", v)}
                  leftIcon={<Icon name="users" size={16} />}
                />
                <SelectInput
                  label="Price Type"
                  options={PRICE_TYPE_OPTIONS}
                  value={row.priceType}
                  onChange={(v) =>
                    updateGroupRow(idx, "priceType", v as string)
                  }
                  leftIcon={<Icon name="tag" size={16} />}
                />
                <NumberInput
                  label="Amount"
                  value={row.amount}
                  onChange={(v) => updateGroupRow(idx, "amount", v)}
                  leftIcon={<Icon name="indian-rupee" size={16} />}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveGroupPrice(row)}
                  disabled={setGroupMut.isPending}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => removeGroupRow(idx)}
                  disabled={groupRows.length <= 1}
                >
                  <Icon name="trash-2" size={16} />
                </Button>
              </div>
            ))}

            <div style={{ marginTop: 12 }}>
              <Button variant="outline" onClick={addGroupRow}>
                <Icon name="plus" size={16} />
                Add Group
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
