"use client";

import { useState, useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import { Button, Icon, Input, Badge } from "@/components/ui";

import { useBrands } from "../hooks/useBrands";

import { BrandForm } from "./BrandForm";

import type { Brand, BrandFilters } from "../types/brands.types";

// ── Constants ────────────────────────────────────────────

const PAGE_SIZE = 12;

// ── Component ────────────────────────────────────────────

export function BrandList() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const params = useMemo<BrandFilters>(
    () => ({
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, page]
  );

  const { data, isLoading } = useBrands(params);

  const brands = useMemo<Brand[]>(() => {
    const raw = data?.data;
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: Brand[] };
    return nested?.data ?? [];
  }, [data]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`/products/brands/${id}`);
    },
    [router]
  );

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
        Loading brands...
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* ── Header ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="tag" size={24} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Brands</h1>
        </div>
        <Button variant="primary" onClick={() => setFormOpen(true)}>
          <Icon name="plus" size={16} />
          New Brand
        </Button>
      </div>

      {/* ── Search ─────────────────────────────────────── */}
      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <Input
          label="Search brands..."
          value={search}
          onChange={handleSearchChange}
          leftIcon={<Icon name="search" size={16} />}
        />
      </div>

      {/* ── Card Grid ──────────────────────────────────── */}
      {brands.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "#9ca3af",
            fontSize: 15,
          }}
        >
          No brands found. Create your first brand to get started.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {brands.map((brand) => (
            <div
              key={brand.id}
              style={cardStyle}
              onClick={() => handleCardClick(brand.id)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {brand.name}
                </h3>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Badge variant="outline">{brand.code}</Badge>
                  <Badge variant={brand.isActive ? "success" : "secondary"}>
                    {brand.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {brand.description && (
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 13,
                    color: "#6b7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {brand.description}
                </p>
              )}

              {brand.website && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    color: "#3b82f6",
                  }}
                >
                  <Icon name="globe" size={14} />
                  <span>{brand.website}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 24,
        }}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          <Icon name="chevron-left" size={16} />
          Previous
        </Button>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 14,
            color: "#6b7280",
            padding: "0 12px",
          }}
        >
          Page {page}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={brands.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <Icon name="chevron-right" size={16} />
        </Button>
      </div>

      {/* ── Form Modal ─────────────────────────────────── */}
      <BrandForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
