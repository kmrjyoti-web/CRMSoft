"use client";

import { useMemo } from "react";

import { SelectInput, Icon } from "@/components/ui";

import { useProductsList } from "@/features/products/hooks/useProducts";
import type { ProductListItem } from "@/features/products/types/products.types";

// ── Types ────────────────────────────────────────────────

export interface ProductSelectOption {
  id: string;
  name: string;
  code: string;
  salePrice?: number;
  mrp?: number;
  hsnCode?: string;
  gstRate?: number;
  cessRate?: number;
  primaryUnit: string;
  shortDescription?: string;
}

interface ProductSelectProps {
  value?: string | null;
  onChange?: (value: string | number | boolean | null) => void;
  /** Called when a product is selected — receives full product data for auto-fill */
  onProductSelect?: (product: ProductSelectOption | null) => void;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}

// ── Component ────────────────────────────────────────────

export function ProductSelect({
  value,
  onChange,
  onProductSelect,
  label = "Product",
  error,
  errorMessage,
  disabled,
}: ProductSelectProps) {
  const { data, isLoading } = useProductsList({ status: "ACTIVE", limit: 10000 });

  const products = useMemo<ProductSelectOption[]>(() => {
    const raw = data?.data;
    const list: ProductListItem[] = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      salePrice: p.salePrice,
      mrp: p.mrp,
      hsnCode: p.hsnCode,
      primaryUnit: p.primaryUnit,
      shortDescription: p.shortDescription,
    }));
  }, [data]);

  const options = useMemo(
    () =>
      products.map((p) => ({
        label: `${p.name} (${p.code})`,
        value: p.id,
      })),
    [products],
  );

  const handleChange = (val: string | number | boolean | null) => {
    onChange?.(val);
    if (onProductSelect) {
      if (val) {
        const product = products.find((p) => p.id === val) ?? null;
        onProductSelect(product);
      } else {
        onProductSelect(null);
      }
    }
  };

  return (
    <SelectInput
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Select product..."
      label={label}
      loading={isLoading}
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      leftIcon={<Icon name="package" size={16} />}
      searchable
      clearable
    />
  );
}
