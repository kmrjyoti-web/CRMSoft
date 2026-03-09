"use client";

import { useState, useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import { Button, Icon, Input, Badge } from "@/components/ui";

import { useManufacturers } from "../hooks/useManufacturers";

import { ManufacturerForm } from "./ManufacturerForm";

import type {
  Manufacturer,
  ManufacturerFilters,
} from "../types/manufacturers.types";

// ── Constants ────────────────────────────────────────────

const PAGE_SIZE = 12;

// ── Component ────────────────────────────────────────────

export function ManufacturerList() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const params = useMemo<ManufacturerFilters>(
    () => ({
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, page]
  );

  const { data, isLoading } = useManufacturers(params);

  const manufacturers = useMemo<Manufacturer[]>(() => {
    const raw = data?.data;
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: Manufacturer[] };
    return nested?.data ?? [];
  }, [data]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`/products/manufacturers/${id}`);
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
        Loading manufacturers...
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
          <Icon name="factory" size={24} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Manufacturers
          </h1>
        </div>
        <Button variant="primary" onClick={() => setFormOpen(true)}>
          <Icon name="plus" size={16} />
          New Manufacturer
        </Button>
      </div>

      {/* ── Search ─────────────────────────────────────── */}
      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <Input
          label="Search manufacturers..."
          value={search}
          onChange={handleSearchChange}
          leftIcon={<Icon name="search" size={16} />}
        />
      </div>

      {/* ── Card Grid ──────────────────────────────────── */}
      {manufacturers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "#9ca3af",
            fontSize: 15,
          }}
        >
          No manufacturers found. Create your first manufacturer to get started.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {manufacturers.map((mfr) => (
            <div
              key={mfr.id}
              style={cardStyle}
              onClick={() => handleCardClick(mfr.id)}
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
                  {mfr.name}
                </h3>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Badge variant="outline">{mfr.code}</Badge>
                  <Badge variant={mfr.isActive ? "success" : "secondary"}>
                    {mfr.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {mfr.country && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 6,
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  <Icon name="map-pin" size={14} />
                  <span>{mfr.country}</span>
                </div>
              )}

              {mfr.description && (
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
                  {mfr.description}
                </p>
              )}

              {mfr.website && (
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
                  <span>{mfr.website}</span>
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
          disabled={manufacturers.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <Icon name="chevron-right" size={16} />
        </Button>
      </div>

      {/* ── Form Modal ─────────────────────────────────── */}
      <ManufacturerForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
