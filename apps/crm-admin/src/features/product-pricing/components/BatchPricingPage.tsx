"use client";

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { TableFull, Badge, Button, Icon } from "@/components/ui";
import { HelpButton } from "@/components/common/HelpButton";
import { useProductsList } from "@/features/products/hooks/useProducts";
import { useBulkUpdatePrices } from "../hooks/useProductPricing";
import type { ProductListItem } from "@/features/products/types/products.types";
import type { PriceType } from "../types/product-pricing.types";

// ── Columns ───────────────────────────────────────────────────────────

const COLUMNS = [
  { id: "name",      label: "Product",       visible: true },
  { id: "mrp",       label: "MRP (₹)",       visible: true },
  { id: "selling",   label: "Selling (₹)",   visible: true },
  { id: "wholesale", label: "Wholesale (₹)", visible: true },
  { id: "status",    label: "Status",        visible: true },
];

// ── Row edit state ────────────────────────────────────────────────────

interface RowEdit {
  mrp: string;
  selling: string;
  wholesale: string;
}

function fmt(v: number | null | undefined) {
  return v != null ? String(v) : "";
}

function hasChanged(current: RowEdit, original: RowEdit) {
  return (
    current.mrp !== original.mrp ||
    current.selling !== original.selling ||
    current.wholesale !== original.wholesale
  );
}

// ── Inline price cell ─────────────────────────────────────────────────

function PriceCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      min={0}
      step={0.01}
      value={value}
      placeholder="—"
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: 88,
        padding: "4px 8px",
        border: "1px solid #d1d5db",
        borderRadius: 6,
        fontSize: 13,
        textAlign: "right",
        outline: "none",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
    />
  );
}

// ── Help ──────────────────────────────────────────────────────────────

function BatchHelp() {
  return (
    <div style={{ fontSize: 14, lineHeight: 1.7, color: "#374151" }}>
      <h3 style={{ marginTop: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>
        Batch Pricing — How It Works
      </h3>

      <section style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>What is Batch Pricing?</h4>
        <p style={{ margin: 0 }}>
          Update MRP, Selling, and Wholesale prices for many products at once — without opening each product individually. Great for seasonal revisions or annual price hikes.
        </p>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>How to use</h4>
        <ol style={{ paddingLeft: 18, margin: 0 }}>
          <li>All products are listed in the table</li>
          <li>Click any price cell and type the new value</li>
          <li>Changed rows show an <strong>Edited</strong> badge</li>
          <li>Click <strong>Save Changes</strong> to apply all at once</li>
          <li>Click <strong>Reset</strong> to discard all edits</li>
        </ol>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>
          Batch Pricing vs Price Tiers
        </h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #e5e7eb" }}></th>
              <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #e5e7eb" }}>Price Tiers</th>
              <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #e5e7eb" }}>Batch Pricing</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Scope", "One product at a time", "All products at once"],
              ["Slab / qty tiers", "✓ Yes", "✗ No"],
              ["Customer group prices", "✓ Yes", "✗ No"],
              ["Best for", "Setting up pricing structure", "Bulk price revision"],
            ].map(([f, a, b]) => (
              <tr key={f}>
                <td style={{ padding: "5px 8px", border: "1px solid #e5e7eb", fontWeight: 500 }}>{f}</td>
                <td style={{ padding: "5px 8px", border: "1px solid #e5e7eb" }}>{a}</td>
                <td style={{ padding: "5px 8px", border: "1px solid #e5e7eb" }}>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>Note</h4>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          Leave a price cell blank to skip updating that price type. Only filled and changed cells are saved.
        </p>
      </section>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export function BatchPricingPage() {
  const { data, isLoading } = useProductsList({ limit: 500 });
  const bulkUpdate = useBulkUpdatePrices();

  const products: ProductListItem[] = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  // edits[productId] = current edited values
  const [edits, setEdits] = useState<Record<string, RowEdit>>({});

  // original values derived from products
  const originals = useMemo<Record<string, RowEdit>>(() => {
    const map: Record<string, RowEdit> = {};
    for (const p of products) {
      map[p.id] = {
        mrp: fmt(p.mrp),
        selling: fmt(p.salePrice),
        wholesale: "",
      };
    }
    return map;
  }, [products]);

  const updateCell = useCallback(
    (productId: string, field: keyof RowEdit, value: string) => {
      setEdits((prev) => {
        const base = prev[productId] ?? originals[productId] ?? { mrp: "", selling: "", wholesale: "" };
        return { ...prev, [productId]: { ...base, [field]: value } };
      });
    },
    [originals]
  );

  const changedCount = useMemo(() => {
    return products.filter((p) => {
      const cur = edits[p.id] ?? originals[p.id];
      const orig = originals[p.id];
      return orig && cur && hasChanged(cur, orig);
    }).length;
  }, [products, edits, originals]);

  const handleSave = useCallback(async () => {
    if (changedCount === 0) { toast("No changes to save"); return; }

    const updates: { productId: string; priceType: PriceType; amount: number }[] = [];

    for (const p of products) {
      const cur = edits[p.id] ?? originals[p.id];
      const orig = originals[p.id];
      if (!cur || !orig) continue;

      if (cur.mrp !== orig.mrp && cur.mrp !== "")
        updates.push({ productId: p.id, priceType: "MRP", amount: parseFloat(cur.mrp) });
      if (cur.selling !== orig.selling && cur.selling !== "")
        updates.push({ productId: p.id, priceType: "SELLING", amount: parseFloat(cur.selling) });
      if (cur.wholesale !== orig.wholesale && cur.wholesale !== "")
        updates.push({ productId: p.id, priceType: "WHOLESALE", amount: parseFloat(cur.wholesale) });
    }

    try {
      await bulkUpdate.mutateAsync({ updates });
      // commit: move edits into originals by clearing edit overrides
      setEdits({});
      toast.success(`${updates.length} price(s) updated for ${changedCount} product(s)`);
    } catch {
      toast.error("Failed to save prices");
    }
  }, [products, edits, originals, changedCount, bulkUpdate]);

  const handleReset = useCallback(() => {
    setEdits({});
    toast("All edits discarded");
  }, []);

  // Build table rows
  const tableRows = useMemo(() => {
    if (isLoading) return [];
    return products.map((p) => {
      const cur = edits[p.id] ?? originals[p.id] ?? { mrp: "", selling: "", wholesale: "" };
      const orig = originals[p.id] ?? { mrp: "", selling: "", wholesale: "" };
      const changed = hasChanged(cur, orig);

      return {
        id: p.id,
        name: (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 600, color: "#111827" }}>{p.name}</span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{p.code}</span>
          </div>
        ),
        mrp: (
          <PriceCell
            value={cur.mrp}
            onChange={(v) => updateCell(p.id, "mrp", v)}
          />
        ),
        selling: (
          <PriceCell
            value={cur.selling}
            onChange={(v) => updateCell(p.id, "selling", v)}
          />
        ),
        wholesale: (
          <PriceCell
            value={cur.wholesale}
            onChange={(v) => updateCell(p.id, "wholesale", v)}
          />
        ),
        status: changed ? (
          <Badge variant="warning">Edited</Badge>
        ) : (
          <span style={{ color: "#9ca3af", fontSize: 13 }}>—</span>
        ),
      };
    });
  }, [products, isLoading, edits, originals, updateCell]);

  return (
    <TableFull
      data={tableRows}
      title="Batch Pricing"
      tableKey="batch-pricing"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      headerActions={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {changedCount > 0 && (
            <Badge variant="warning">{changedCount} product{changedCount !== 1 ? "s" : ""} changed</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={changedCount === 0}
          >
            <Icon name="rotate-ccw" size={14} /> Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={bulkUpdate.isPending || changedCount === 0}
          >
            <Icon name="save" size={14} />
            {bulkUpdate.isPending
              ? "Saving…"
              : changedCount > 0
              ? `Save Changes (${changedCount})`
              : "Save Changes"}
          </Button>
          <HelpButton
            panelId="batch-pricing-help"
            title="Batch Pricing — Help"
            userContent={<BatchHelp />}
          />
        </div>
      }
    />
  );
}
