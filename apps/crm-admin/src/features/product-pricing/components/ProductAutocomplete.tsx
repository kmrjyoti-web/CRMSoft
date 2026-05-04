"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui";
import { useProductsList } from "@/features/products/hooks/useProducts";
import type { ProductListItem } from "@/features/products/types/products.types";

interface ProductAutocompleteProps {
  value: string;
  onSelect: (product: ProductListItem) => void;
  placeholder?: string;
}

export function ProductAutocomplete({ value, onSelect, placeholder = "Search product by name or code..." }: ProductAutocompleteProps) {
  const [search, setSearch] = useState(value || "");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useProductsList(
    search.length >= 1 ? { search, limit: 10 } : undefined
  );

  const products: ProductListItem[] = (data as any)?.data ?? (data as any) ?? [];
  const list = Array.isArray(products) ? products : [];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (product: ProductListItem) => {
    setSearch(`${product.name} (${product.code})`);
    setOpen(false);
    onSelect(product);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", flex: 1 }}>
      {/* Input */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
          <Icon name="package" size={16} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "9px 12px 9px 34px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            background: "#fff",
            boxSizing: "border-box",
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        />
        {isLoading && (
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
            <Icon name="loader" size={14} />
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && list.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          zIndex: 9999,
          maxHeight: 280,
          overflowY: "auto",
        }}>
          {list.map((product) => (
            <div
              key={product.id}
              onClick={() => handleSelect(product)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: "1px solid #f3f4f6",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 32, height: 32, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="package" size={14} color="#6b7280" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{product.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{product.code}{product.hsnCode ? ` · HSN: ${product.hsnCode}` : ""}</div>
              </div>
              {product.mrp != null && (
                <div style={{ marginLeft: "auto", fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  ₹{product.mrp}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {open && search.length >= 1 && !isLoading && list.length === 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "14px 16px",
          fontSize: 14,
          color: "#6b7280",
          zIndex: 9999,
        }}>
          No products found for "{search}"
        </div>
      )}
    </div>
  );
}
