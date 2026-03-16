"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/ui/Icon";

import { SmartSearch } from "./SmartSearch";
import type { SmartSearchField, SmartSearchColumn } from "./SmartSearch";
import { ProductPickerModal } from "./ProductPickerModal";

import { useProductsList } from "@/features/products/hooks/useProducts";
import type { ProductListItem } from "@/features/products/types/products.types";

// ── Types ────────────────────────────────────────────────

export interface ProductSelectOption {
  id: string;
  name: string;
  code: string;
  salePrice?: number;
  purchasePrice?: number;
  costPrice?: number;
  mrp?: number;
  hsnCode?: string;
  gstRate?: number;
  cessRate?: number;
  primaryUnit: string;
  shortDescription?: string;
}

export type ProductDisplayMode = "compact" | "detailed";
export type ProductInputMode = "autocomplete" | "popup";

interface ProductSelectProps {
  value?: string | null;
  onChange?: (value: string | number | boolean | null) => void;
  /** Called when a product is selected — receives full product data for auto-fill */
  onProductSelect?: (product: ProductSelectOption | null) => void;
  /** Pre-filter products before showing (e.g., only certain categories) */
  filterFn?: (product: ProductSelectOption) => boolean;
  /** "compact" = single line, "detailed" = two-line with price/HSN/unit (default: "compact") */
  displayMode?: ProductDisplayMode;
  /** "autocomplete" = SmartSearch dropdown, "popup" = full modal picker (default: "autocomplete") */
  inputMode?: ProductInputMode;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}

// ── Currency formatter ───────────────────────────────────

const fmtPrice = (n?: number) =>
  n != null ? `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "";

// ── Field definitions for SmartSearch ────────────────────

const PRODUCT_FIELDS: SmartSearchField[] = [
  { key: "NM", label: "Product Name", accessor: "name", isDefault: true },
  { key: "PC", label: "Product Code", accessor: "code", isDefault: true },
  { key: "HS", label: "HSN Code", accessor: "hsnCode" },
  { key: "DS", label: "Description", accessor: "shortDescription" },
  { key: "UN", label: "Unit", accessor: "primaryUnit" },
];

const PRODUCT_TABLE_COLUMNS: SmartSearchColumn<ProductSelectOption>[] = [
  { key: "name", header: "Name", accessor: "name" },
  { key: "code", header: "Code", accessor: "code", width: "80px" },
  { key: "salePrice", header: "Price", accessor: (p) => fmtPrice(p.salePrice), width: "90px" },
  { key: "hsnCode", header: "HSN", accessor: "hsnCode", width: "80px" },
  { key: "unit", header: "Unit", accessor: "primaryUnit", width: "60px" },
];

// ── Component ────────────────────────────────────────────

export function ProductSelect({
  value,
  onChange,
  onProductSelect,
  filterFn,
  displayMode = "compact",
  inputMode = "autocomplete",
  label = "Product",
  error,
  errorMessage,
  disabled,
}: ProductSelectProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const { data, isLoading } = useProductsList({ status: "ACTIVE", limit: 10000 });

  const products = useMemo<ProductSelectOption[]>(() => {
    const raw = data?.data;
    const list: ProductListItem[] = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    const mapped = list.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      salePrice: p.salePrice,
      purchasePrice: (p as any).purchasePrice,
      costPrice: (p as any).costPrice,
      mrp: p.mrp,
      hsnCode: p.hsnCode,
      primaryUnit: p.primaryUnit,
      shortDescription: p.shortDescription,
    }));
    return filterFn ? mapped.filter(filterFn) : mapped;
  }, [data, filterFn]);

  // ── Render helpers ────────────────────────────────────

  const renderListItem = (p: ProductSelectOption, isSelected: boolean, _isHighlighted: boolean) => {
    if (displayMode === "detailed") {
      return (
        <div className="flex flex-col gap-0.5 w-full min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{p.name}</span>
            <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">{p.code}</span>
            {isSelected && <Icon name="check" size={14} className="ml-auto text-[var(--color-primary)] flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            {p.salePrice != null && <span>{fmtPrice(p.salePrice)}</span>}
            {p.hsnCode && <span>HSN: {p.hsnCode}</span>}
            {p.primaryUnit && <span>{p.primaryUnit}</span>}
            {p.gstRate != null && <span>GST {p.gstRate}%</span>}
          </div>
        </div>
      );
    }

    // compact
    return (
      <div className="flex items-center gap-2 w-full min-w-0">
        <span className="text-sm truncate">
          {p.name} <span className="text-gray-400">({p.code})</span>
        </span>
        {p.salePrice != null && (
          <span className="ml-auto text-[11px] text-gray-400 flex-shrink-0 tabular-nums">{fmtPrice(p.salePrice)}</span>
        )}
        {isSelected && <Icon name="check" size={14} className="text-[var(--color-primary)] flex-shrink-0" />}
      </div>
    );
  };

  const renderCardItem = (p: ProductSelectOption, isSelected: boolean) => (
    <div className="flex flex-col gap-1 p-2 w-full min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm truncate">{p.name}</span>
        {isSelected && <Icon name="check" size={14} className="ml-auto text-[var(--color-primary)]" />}
      </div>
      <div className="text-[11px] text-gray-400 font-mono">{p.code}</div>
      <div className="flex items-center gap-2 text-[11px] text-gray-500">
        {p.salePrice != null && <span>{fmtPrice(p.salePrice)}</span>}
        {p.primaryUnit && <span>{p.primaryUnit}</span>}
      </div>
    </div>
  );

  // ── Popup mode ────────────────────────────────────────
  if (inputMode === "popup") {
    const selectedProduct = products.find((p) => p.id === value);
    return (
      <>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setPopupOpen(true)}
          className={[
            "w-full flex items-center gap-1.5 rounded-md border px-2.5 py-[7px] text-sm text-left transition-colors",
            error ? "border-red-400" : "border-gray-300 hover:border-[var(--color-primary)]",
            disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white cursor-pointer",
          ].join(" ")}
        >
          <Icon name="package" size={14} className="text-gray-400 flex-shrink-0" />
          <span className={`flex-1 truncate ${selectedProduct ? "text-gray-800" : "text-gray-400"}`}>
            {selectedProduct ? `${selectedProduct.name} (${selectedProduct.code})` : (label || "Select product…")}
          </span>
          {selectedProduct && !disabled && (
            <span
              className="text-gray-300 hover:text-red-400 flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); onChange?.(null); onProductSelect?.(null); }}
            >
              <Icon name="x" size={12} />
            </span>
          )}
          <Icon name="search" size={13} className="text-gray-300 flex-shrink-0" />
        </button>
        {error && errorMessage && <span className="text-xs text-red-500 mt-0.5 block">{errorMessage}</span>}
        <ProductPickerModal
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          selectedId={value}
          onSelect={(product) => {
            onChange?.(product.id);
            onProductSelect?.(product);
          }}
        />
      </>
    );
  }

  return (
    <SmartSearch<ProductSelectOption>
      items={products}
      fields={PRODUCT_FIELDS}
      idAccessor="id"
      value={value}
      onChange={(id) => {
        onChange?.(id);
        if (!id) onProductSelect?.(null);
      }}
      onSelect={(item) => onProductSelect?.(item)}
      displayMode="list"
      allowModeSwitch
      renderListItem={renderListItem}
      renderCardItem={renderCardItem}
      tableColumns={PRODUCT_TABLE_COLUMNS}
      formatSelected={(p) => `${p.name} (${p.code})`}
      label={label}
      placeholder="Search by name, code, HSN..."
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      loading={isLoading}
      minDropdownWidth={320}
    />
  );
}
