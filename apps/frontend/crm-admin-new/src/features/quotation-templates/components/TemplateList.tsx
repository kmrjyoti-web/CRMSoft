"use client";

import { useState, useMemo } from "react";
import { Button, Card, Badge, Input, SelectInput, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useQuotationTemplates } from "../hooks/useQuotationTemplates";
import type { QuotationTemplate, TemplateFilters } from "../types/quotation-templates.types";

// ── Types ─────────────────────────────────────────────

interface TemplateListProps {
  onEdit?: (template: QuotationTemplate) => void;
  onCreate?: () => void;
}

// ── Helpers ───────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "Standard", value: "STANDARD" },
  { label: "Enterprise", value: "ENTERPRISE" },
  { label: "Startup", value: "STARTUP" },
  { label: "Government", value: "GOVERNMENT" },
  { label: "Custom", value: "CUSTOM" },
];

// ── Component ─────────────────────────────────────────

export function TemplateList({ onEdit, onCreate }: TemplateListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filters: TemplateFilters = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
    }),
    [search, category],
  );

  const { data: templatesRaw, isLoading } = useQuotationTemplates(filters);

  // Safely unwrap
  const templates: QuotationTemplate[] = useMemo(() => {
    const raw = templatesRaw as any;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  }, [templatesRaw]);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="layout-template" size={20} color="#3b82f6" />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Quotation Templates
          </h2>
          <Badge variant="secondary">{templates.length}</Badge>
        </div>
        <Button variant="primary" onClick={onCreate}>
          <Icon name="plus" size={16} /> Create Template
        </Button>
      </div>

      {/* ── Filters ────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input
            label="Search templates"
            value={search}
            onChange={(val) => setSearch(val)}
            leftIcon={<Icon name="search" size={16} />}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <SelectInput
            label="Category"
            value={category}
            onChange={(val) => setCategory(val as string)}
            options={CATEGORY_OPTIONS}
            leftIcon={<Icon name="tag" size={16} />}
          />
        </div>
      </div>

      {/* ── Loading ────────────────────────────────────── */}
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <LoadingSpinner />
        </div>
      )}

      {/* ── Empty State ────────────────────────────────── */}
      {!isLoading && templates.length === 0 && (
        <Card>
          <div style={{ padding: 48, textAlign: "center" }}>
            <Icon name="layout-template" size={40} color="#cbd5e1" />
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 12 }}>
              No templates found. Create your first template to get started.
            </p>
            <Button variant="primary" onClick={onCreate} style={{ marginTop: 12 }}>
              <Icon name="plus" size={16} /> Create Template
            </Button>
          </div>
        </Card>
      )}

      {/* ── Template Grid ──────────────────────────────── */}
      {!isLoading && templates.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {templates.map((tpl) => (
            <Card key={tpl.id}>
              <div
                style={{
                  padding: 20,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s ease",
                }}
                onClick={() => onEdit?.(tpl)}
              >
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: "0 0 4px 0" }}>
                      {tpl.name}
                    </h3>
                    {tpl.description && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {tpl.description}
                      </p>
                    )}
                  </div>
                  {tpl.category && (
                    <Badge variant="primary">{tpl.category}</Badge>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="package" size={14} color="#94a3b8" />
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {tpl.items.length} item{tpl.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="bar-chart-2" size={14} color="#94a3b8" />
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      Used {tpl.usageCount} time{tpl.usageCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {tpl.defaultDiscount != null && tpl.defaultDiscount > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Icon name="percent" size={14} color="#94a3b8" />
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        {tpl.defaultDiscount}% discount
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <Badge variant={tpl.isActive ? "success" : "secondary"}>
                    {tpl.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {tpl.lastUsedAt && (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      Last used {new Date(tpl.lastUsedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
