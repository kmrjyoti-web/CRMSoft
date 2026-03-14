"use client";

import { useMemo, useCallback } from "react";
import { TableFull, Badge, Button, Icon } from "@/components/ui";
import { HelpButton } from "@/components/common/HelpButton";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { useProductsList } from "@/features/products/hooks/useProducts";
import { PriceDrawerForm } from "./PriceDrawerForm";
import { PricingUserHelp } from "../help/PricingHelp";
import type { ProductListItem } from "@/features/products/types/products.types";

// ── Columns ───────────────────────────────────────────────────────────

const COLUMNS = [
  { id: "name",      label: "Product",   visible: true },
  { id: "mrp",       label: "MRP",       visible: true },
  { id: "salePrice", label: "Sale Price", visible: true },
  { id: "unit",      label: "Unit",      visible: true },
  { id: "hsn",       label: "HSN Code",  visible: true },
  { id: "status",    label: "Status",    visible: true },
  { id: "calc",      label: "",          visible: true },
];

// ── Main Component ────────────────────────────────────────────────────

export function PricingListPage() {
  const { data, isLoading } = useProductsList({ limit: 100 });
  const { openPanel } = useSidePanelStore();

  const products: ProductListItem[] = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const openDrawer = useCallback(
    (product: ProductListItem, tab: "base" | "slabs" | "groups" | "calc" = "base") => {
      const panelId = `pricing-${product.id}-${tab}`;
      openPanel({
        id: panelId,
        title: `Pricing — ${product.name}`,
        icon: "indian-rupee",
        width: 600,
        noPadding: true,
        content: (
          <PriceDrawerForm
            productId={product.id}
            productName={product.name}
            productDefaults={{ mrp: product.mrp, salePrice: product.salePrice }}
            panelId={panelId}
            initialTab={tab}
          />
        ),
      });
    },
    [openPanel]
  );

  const rows = useMemo(() => {
    if (isLoading) return [];
    return products.map((p) => ({
      id: p.id,
      _product: p,
      name: (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 600, color: "#111827" }}>{p.name}</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{p.code}</span>
        </div>
      ),
      mrp:      p.mrp      != null ? `₹${p.mrp.toLocaleString("en-IN")}` : "—",
      salePrice: p.salePrice != null ? `₹${p.salePrice.toLocaleString("en-IN")}` : "—",
      unit: p.primaryUnit || "—",
      hsn: p.hsnCode ? (
        <code style={{ fontSize: 12, background: "#f3f4f6", padding: "1px 5px", borderRadius: 4 }}>{p.hsnCode}</code>
      ) : "—",
      status: (
        <Badge variant={p.isActive ? "success" : "secondary"}>
          {p.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
      // Direct calculator icon — opens drawer on Calculator tab
      calc: (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); openDrawer(p, "calc"); }}
          title="Open Price Calculator"
          style={{ padding: "4px 6px" }}
        >
          <Icon name="calculator" size={15} color="#6b7280" />
        </Button>
      ),
    }));
  }, [products, isLoading, openDrawer]);

  return (
    <TableFull
      data={rows}
      title="Product Pricing"
      tableKey="product-pricing-list"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={(row) => openDrawer(row._product, "base")}
      onCreate={() => products[0] && openDrawer(products[0], "base")}
      headerActions={
        <HelpButton
          panelId="pricing-help"
          title="Product Pricing — Help"
          userContent={<PricingUserHelp />}
        />
      }
    />
  );
}
