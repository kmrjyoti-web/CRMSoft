"use client";

import { useState, useCallback } from "react";

import { Button, Icon, Input } from "@/components/ui";

import { PriceEditor } from "./PriceEditor";
import { PriceCalculator } from "./PriceCalculator";

// ── Component ────────────────────────────────────────────

export function ProductPricingPage() {
  const [inputId, setInputId] = useState("");
  const [productId, setProductId] = useState<string | null>(null);

  const handleLoad = useCallback(() => {
    const trimmed = inputId.trim();
    if (!trimmed) return;
    setProductId(trimmed);
  }, [inputId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleLoad();
    },
    [handleLoad]
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <Icon name="indian-rupee" size={24} />
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
          Product Pricing
        </h1>
      </div>

      {/* ── Product ID Input ─────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }} onKeyDown={handleKeyDown}>
            <Input
              label="Enter Product ID"
              value={inputId}
              onChange={setInputId}
              leftIcon={<Icon name="package" size={16} />}
            />
          </div>
          <Button variant="primary" onClick={handleLoad} disabled={!inputId.trim()}>
            <Icon name="search" size={16} />
            Load
          </Button>
        </div>
      </div>

      {/* ── Editor + Calculator ──────────────────────── */}
      {productId && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <PriceEditor productId={productId} />
          <PriceCalculator productId={productId} />
        </div>
      )}
    </div>
  );
}
