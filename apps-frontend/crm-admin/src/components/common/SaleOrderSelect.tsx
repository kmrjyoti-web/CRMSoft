"use client";

import { useMemo, useState, useCallback } from "react";

import { SelectInput, Icon } from "@/components/ui";

import { useSaleOrderList } from "@/features/sales/hooks/useSales";

// ── Types ────────────────────────────────────────────────

export interface SaleOrderSelectOption {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  grandTotal?: number;
}

interface SaleOrderSelectProps {
  value?: string | null;
  onChange?: (value: string | number | boolean | null) => void;
  onSaleOrderSelect?: (saleOrder: SaleOrderSelectOption | null) => void;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
}

// ── Component ────────────────────────────────────────────

export function SaleOrderSelect({
  value,
  onChange,
  onSaleOrderSelect,
  label = "Sale Order",
  error,
  errorMessage,
  disabled,
  required,
}: SaleOrderSelectProps) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useSaleOrderList(
    search.length >= 2 ? { search, limit: "30" } : { limit: "30" },
  );

  const saleOrders = useMemo<SaleOrderSelectOption[]>(() => {
    const raw = (data as any)?.data;
    const list: any[] = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((so) => ({
      id: so.id,
      orderNumber: so.orderNumber,
      customerId: so.customerId,
      status: so.status,
      grandTotal: so.grandTotal ? Number(so.grandTotal) : undefined,
    }));
  }, [data]);

  const options = useMemo(
    () =>
      saleOrders.map((so) => ({
        label: `${so.orderNumber} – ${so.status}`,
        value: so.id,
      })),
    [saleOrders],
  );

  const handleChange = (val: string | number | boolean | null) => {
    onChange?.(val);
    if (onSaleOrderSelect) {
      if (val) {
        const so = saleOrders.find((s) => s.id === val) ?? null;
        onSaleOrderSelect(so);
      } else {
        onSaleOrderSelect(null);
      }
    }
  };

  const handleSearch = useCallback((term: string) => {
    setSearch(term);
  }, []);

  return (
    <SelectInput
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Type 2+ chars to search sale orders..."
      label={label}
      loading={isLoading}
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      required={required}
      leftIcon={<Icon name="shopping-cart" size={16} />}
      searchable
      clearable
    />
  );
}
