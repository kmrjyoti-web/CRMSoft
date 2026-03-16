"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { useProductsList } from "@/features/products/hooks/useProducts";
import type { ProductListItem } from "@/features/products/types/products.types";
import type { ProductSelectOption } from "./ProductSelect";

// ── Types ────────────────────────────────────────────────

interface ProductPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: ProductSelectOption) => void;
  selectedId?: string | null;
}

type SortKey = "name" | "salePrice" | "mrp" | "primaryUnit";
type SortDir = "asc" | "desc";

const fmtPrice = (n?: number) =>
  n != null ? n.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00";

// ── Component ────────────────────────────────────────────

export function ProductPickerModal({ open, onClose, onSelect, selectedId }: ProductPickerModalProps) {
  const { data, isLoading } = useProductsList({ status: "ACTIVE", limit: 10000 });
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const products = useMemo<ProductSelectOption[]>(() => {
    const raw = data?.data;
    const list: ProductListItem[] = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      salePrice: p.salePrice,
      purchasePrice: (p as any).purchasePrice,
      costPrice: (p as any).costPrice,
      mrp: p.mrp,
      hsnCode: p.hsnCode,
      gstRate: (p as any).gstRate,
      cessRate: (p as any).cessRate,
      primaryUnit: p.primaryUnit,
      shortDescription: p.shortDescription,
    }));
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            (p.hsnCode ?? "").toLowerCase().includes(q) ||
            (p.shortDescription ?? "").toLowerCase().includes(q),
        )
      : products;

    return [...list].sort((a, b) => {
      let av: string | number = a[sortKey] ?? "";
      let bv: string | number = b[sortKey] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, search, sortKey, sortDir]);

  const hovered = products.find((p) => p.id === hoveredId) ?? null;

  // Focus search on open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <Icon name={sortDir === "asc" ? "chevron-up" : "chevron-down"} size={12} />
    ) : (
      <Icon name="chevrons-up-down" size={12} className="opacity-30" />
    );

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex flex-col bg-white rounded-lg shadow-2xl w-[960px] max-w-[96vw] h-[80vh] max-h-[700px]">

        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <span className="text-sm font-semibold text-gray-700">Select Item</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              Total no of items: {products.length.toLocaleString()}
            </span>
            <button
              type="button"
              className="flex items-center gap-1 rounded bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
              onClick={onClose}
            >
              <Icon name="plus" size={12} />
              Create/F2
            </button>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
          <div className="relative flex-1">
            <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here.."
              className="w-full rounded border border-gray-300 pl-8 pr-3 py-1.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* Table area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">Loading products…</div>
          ) : (
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col />{/* Description */}
                <col className="w-28" />{/* Stock */}
                <col className="w-20" />{/* Unit */}
                <col className="w-28" />{/* M.R.P */}
                <col className="w-20" />{/* Action */}
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="bg-[var(--color-primary)] text-white text-xs font-semibold uppercase">
                  <th
                    className="px-3 py-2 text-left cursor-pointer select-none hover:bg-[var(--color-primary-700)]"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-1">Description <SortIcon col="name" /></div>
                  </th>
                  <th className="px-3 py-2 text-right">Stock</th>
                  <th
                    className="px-3 py-2 text-left cursor-pointer select-none hover:bg-[var(--color-primary-700)]"
                    onClick={() => toggleSort("primaryUnit")}
                  >
                    <div className="flex items-center gap-1">Unit <SortIcon col="primaryUnit" /></div>
                  </th>
                  <th
                    className="px-3 py-2 text-right cursor-pointer select-none hover:bg-[var(--color-primary-700)]"
                    onClick={() => toggleSort("mrp")}
                  >
                    <div className="flex items-center justify-end gap-1">M.R.P <SortIcon col="mrp" /></div>
                  </th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const isSelected = p.id === selectedId;
                  return (
                    <tr
                      key={p.id}
                      className={[
                        "border-b border-gray-100 cursor-pointer transition-colors",
                        isSelected ? "bg-yellow-100 font-semibold" : idx % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50/60 hover:bg-blue-50",
                      ].join(" ")}
                      onClick={() => { onSelect(p); onClose(); }}
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <td className="px-3 py-1.5 truncate">{p.name}</td>
                      <td className="px-3 py-1.5 text-right text-gray-500">0:0</td>
                      <td className="px-3 py-1.5">{p.primaryUnit}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{fmtPrice(p.mrp)}</td>
                      <td className="px-3 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-blue-500"
                            onClick={(e) => { e.stopPropagation(); onSelect(p); onClose(); }}
                            title="Select"
                          >
                            <Icon name="pencil" size={13} />
                          </button>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-red-500"
                            onClick={(e) => e.stopPropagation()}
                            title="Info"
                          >
                            <Icon name="trash-2" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-400">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail panel at bottom */}
        {hovered && (
          <div className="flex-none border-t border-gray-200 bg-gray-50 px-4 py-2 grid grid-cols-4 gap-x-6 gap-y-0.5 text-xs">
            <div>
              <span className="text-gray-500">M.R.P</span>
              <span className="ml-2 font-medium text-[var(--color-primary)] tabular-nums">₹ {fmtPrice(hovered.mrp)}</span>
            </div>
            <div>
              <span className="text-gray-500">Sale Price</span>
              <span className="ml-2 font-medium tabular-nums">₹ {fmtPrice(hovered.salePrice)}</span>
            </div>
            <div>
              <span className="text-gray-500">HSN/SAC</span>
              <span className="ml-2 font-medium">{hovered.hsnCode ?? "—"}</span>
            </div>
            {hovered.gstRate != null && (
              <div>
                <span className="text-gray-500">GST %</span>
                <span className="ml-2 font-medium">{hovered.gstRate}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer shortcut bar */}
        <div className="flex-none flex items-center gap-2 px-4 py-1.5 bg-gray-100 border-t border-gray-200 rounded-b-lg">
          {[
            { key: "F4", label: "Ledger" },
            { key: "F6", label: "Old Rates" },
            { key: "F7", label: "Substitute" },
            { key: "F8", label: "Salt" },
            { key: "F9", label: "Company" },
          ].map((s) => (
            <button
              key={s.key}
              type="button"
              className="flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              <span className="font-semibold text-gray-400">{s.key}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
