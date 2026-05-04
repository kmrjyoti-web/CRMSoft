"use client";

import { useState, useCallback } from "react";

import toast from "react-hot-toast";

import { Button, Icon, NumberInput, Badge, Checkbox } from "@/components/ui";

import { ContactSelect } from "@/components/common/ContactSelect";
import { OrganizationSelect } from "@/components/common/OrganizationSelect";

import { useEffectivePrice } from "../hooks/useProductPricing";

import type { EffectivePrice } from "../types/product-pricing.types";
import { formatCurrency } from "@/lib/format-currency";

// ── Props ────────────────────────────────────────────────

interface PriceCalculatorProps {
  productId: string;
}

// ── Component ────────────────────────────────────────────

export function PriceCalculator({ productId }: PriceCalculatorProps) {
  const effectivePriceMut = useEffectivePrice();

  const [quantity, setQuantity] = useState<number | null>(1);
  const [contactId, setContactId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isInterState, setIsInterState] = useState(false);
  const [result, setResult] = useState<EffectivePrice | null>(null);

  const handleCalculate = useCallback(async () => {
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      const response = await effectivePriceMut.mutateAsync({
        productId,
        quantity,
        contactId: contactId || undefined,
        organizationId: organizationId || undefined,
        isInterState,
      });
      setResult(response.data);
      toast.success("Price calculated successfully");
    } catch {
      toast.error("Failed to calculate price");
    }
  }, [productId, quantity, contactId, organizationId, isInterState, effectivePriceMut]);

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #e5e7eb",
  };


  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Icon name="calculator" size={20} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          Price Calculator
        </h3>
      </div>

      {/* ── Input Fields ──────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <NumberInput
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          leftIcon={<Icon name="hash" size={16} />}
        />

        <div style={{ display: "flex", alignItems: "center", paddingTop: 8 }}>
          <Checkbox
            checked={isInterState}
            onChange={() => setIsInterState(!isInterState)}
            label="Inter-State"
          />
        </div>

        <ContactSelect
          value={contactId}
          onChange={(v) => setContactId(v as string | null)}
          label="Contact (Optional)"
          leftIcon={<Icon name="user" size={16} />}
        />

        <OrganizationSelect
          value={organizationId}
          onChange={(v) => setOrganizationId(v as string | null)}
          label="Organization (Optional)"
          leftIcon={<Icon name="building-2" size={16} />}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Button
          variant="primary"
          onClick={handleCalculate}
          disabled={effectivePriceMut.isPending}
        >
          <Icon name="calculator" size={16} />
          Calculate
        </Button>
      </div>

      {/* ── Result Card ───────────────────────────────── */}
      {result && (
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600 }}>
            Price Breakup
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#6b7280", fontSize: 14 }}>Base Price</span>
              <span style={{ fontWeight: 500 }}>
                {formatCurrency(result.basePrice)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#6b7280", fontSize: 14 }}>
                Selling Price
              </span>
              <span style={{ fontWeight: 500 }}>
                {formatCurrency(result.sellingPrice)}
              </span>
            </div>

            {result.discount != null && result.discount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#6b7280", fontSize: 14 }}>Discount</span>
                <Badge variant="success">
                  {formatCurrency(result.discount)}
                </Badge>
              </div>
            )}

            {result.gstRate != null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#6b7280", fontSize: 14 }}>
                  GST ({result.gstRate}%)
                </span>
                <span style={{ fontWeight: 500 }}>
                  {formatCurrency(result.gstAmount ?? 0)}
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #e5e7eb",
                paddingTop: 8,
                marginTop: 4,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 15 }}>Total Amount</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#059669" }}>
                {formatCurrency(result.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
