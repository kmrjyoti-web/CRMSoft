"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon, Badge, Button, Card, Input } from "@/components/ui";
import { useTemplateList, useSetDefaultTemplate } from "../hooks/useDocumentTemplates";
import type { DocumentTemplate } from "../types/document-template.types";

type ViewMode = "grid" | "list";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "INVOICE", label: "Invoice" },
  { value: "QUOTATION", label: "Quotation" },
  { value: "PURCHASE_ORDER", label: "Purchase Order" },
  { value: "DELIVERY_NOTE", label: "Delivery Note" },
  { value: "CREDIT_NOTE", label: "Credit Note" },
  { value: "RECEIPT", label: "Receipt" },
  { value: "PROFORMA", label: "Proforma Invoice" },
  { value: "CUSTOMER_STATEMENT", label: "Customer Statement" },
];

function getTypeBadgeVariant(type: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, "primary" | "success" | "warning" | "secondary" | "danger"> = {
    INVOICE: "primary",
    QUOTATION: "success",
    PURCHASE_ORDER: "warning",
    DELIVERY_NOTE: "secondary",
    CREDIT_NOTE: "danger",
    RECEIPT: "primary",
    PROFORMA: "warning",
  };
  return map[type] ?? "secondary";
}

function formatDocType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function TemplateList() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  const params = useMemo(
    () => (typeFilter ? { documentType: typeFilter } : undefined),
    [typeFilter],
  );

  const { data, isLoading, refetch } = useTemplateList(params);
  const setDefault = useSetDefaultTemplate();

  const templates: DocumentTemplate[] = useMemo(() => {
    const list = (data?.data ?? []) as DocumentTemplate[];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        t.documentType.toLowerCase().includes(q),
    );
  }, [data, search]);

  const handleCardClick = useCallback((id: string) => {
    router.push(`/settings/templates/${id}/designer`);
  }, [router]);

  function handleSetDefault(e: React.MouseEvent, templateId: string) {
    e.stopPropagation();
    setDefault.mutate(templateId);
  }

  function handleCreate() {
    router.push("/settings/templates/new");
  }

  return (
    <div className="p-0">
      {/* ─── Toolbar ─── */}
      <div
        className="template-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderBottom: "1px solid var(--cui-border-color, #d8dbe0)",
          background: "var(--cui-body-bg, #fff)",
          flexWrap: "wrap",
          minHeight: 48,
        }}
      >
        {/* Title */}
        <span style={{ fontWeight: 600, fontSize: 15, whiteSpace: "nowrap" }}>
          Document Templates
        </span>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#d8dbe0", margin: "0 4px" }} />

        {/* Global Search */}
        <div style={{ width: 240 }}>
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: 32,
              padding: "4px 8px 4px 32px",
              border: "1px solid var(--cui-border-color, #d8dbe0)",
              borderRadius: 4,
              fontSize: 13,
              outline: "none",
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E") no-repeat 8px center`,
            }}
          />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#d8dbe0", margin: "0 4px" }} />

        {/* Filter Toggle */}
        <button
          className={`toolbar-icon-btn ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
          title="Toggle Filters"
        >
          <Icon name="filter" size={16} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#d8dbe0", margin: "0 4px" }} />

        {/* View Mode Toggles */}
        <div className="d-flex" style={{ border: "1px solid var(--cui-border-color, #d8dbe0)", borderRadius: 4, overflow: "hidden" }}>
          <button
            className={`toolbar-view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            <Icon name="grid" size={15} />
          </button>
          <button
            className={`toolbar-view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <Icon name="list" size={15} />
          </button>
        </div>

        {/* Refresh */}
        <button
          className="toolbar-icon-btn"
          onClick={() => refetch()}
          title="Refresh"
        >
          <Icon name="refresh-cw" size={16} />
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Count */}
        <span className="text-muted" style={{ fontSize: 13 }}>
          {templates.length} template{templates.length !== 1 ? "s" : ""}
        </span>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#d8dbe0", margin: "0 4px" }} />

        {/* Create Button */}
        <Button variant="primary" size="sm" onClick={handleCreate}>
          <Icon name="plus" size={14} /> Create Template
        </Button>
      </div>

      {/* ─── Filter Bar (collapsible) ─── */}
      {showFilters && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            borderBottom: "1px solid var(--cui-border-color, #d8dbe0)",
            background: "var(--cui-tertiary-bg, #f8f9fa)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Filters
          </span>
          <div style={{ width: 1, height: 20, background: "#d8dbe0" }} />

          {/* Type filter chips */}
          <div className="d-flex gap-1 flex-wrap">
            {DOCUMENT_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`filter-chip ${typeFilter === opt.value ? "active" : ""}`}
                onClick={() => setTypeFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {typeFilter && (
            <>
              <div style={{ width: 1, height: 20, background: "#d8dbe0" }} />
              <button
                className="toolbar-icon-btn"
                onClick={() => setTypeFilter("")}
                title="Clear Filters"
                style={{ color: "#e55353", fontSize: 12 }}
              >
                <Icon name="x" size={14} /> Clear
              </button>
            </>
          )}
        </div>
      )}

      {/* ─── Content Area ─── */}
      <div style={{ padding: 16 }}>
        {/* Loading */}
        {isLoading && (
          <div className="text-center py-5 text-muted">
            <Icon name="loader" size={24} /> Loading templates...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && templates.length === 0 && (
          <Card>
            <div className="text-center py-5 text-muted">
              <Icon name="file-x" size={40} />
              <p className="mt-3 mb-1">No templates found.</p>
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                {typeFilter ? "Try changing the filter or " : ""}
                Create a new template to get started.
              </p>
            </div>
          </Card>
        )}

        {/* ─── Grid View ─── */}
        {!isLoading && templates.length > 0 && viewMode === "grid" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            {templates.map((tpl) => (
              <Card
                key={tpl.id}
                style={{ cursor: "pointer", transition: "box-shadow 0.2s" }}
                className="template-card"
                onClick={() => handleCardClick(tpl.id)}
              >
                <div className="p-4">
                  {/* Thumbnail */}
                  <div
                    style={{
                      height: 120,
                      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                      overflow: "hidden",
                    }}
                  >
                    {tpl.thumbnailUrl ? (
                      <img
                        src={tpl.thumbnailUrl}
                        alt={tpl.name}
                        style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <Icon name="file-text" size={40} />
                    )}
                  </div>

                  {/* Type badge */}
                  <div className="mb-2">
                    <Badge variant={getTypeBadgeVariant(tpl.documentType)}>
                      {formatDocType(tpl.documentType)}
                    </Badge>
                  </div>

                  {/* Template Info */}
                  <div className="d-flex align-items-start justify-content-between mb-1">
                    <h6 className="mb-0" style={{ fontWeight: 600, fontSize: 14 }}>
                      {tpl.name}
                    </h6>
                    <div className="d-flex gap-1 flex-shrink-0 ms-1">
                      {tpl.isDefault && <Badge variant="success">Default</Badge>}
                    </div>
                  </div>

                  {tpl.description && (
                    <p
                      className="text-muted mb-2"
                      style={{
                        fontSize: 12,
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

                  {/* Actions */}
                  <div className="d-flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleCardClick(tpl.id);
                      }}
                    >
                      <Icon name="settings" size={14} /> Customize
                    </Button>
                    {!tpl.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => handleSetDefault(e, tpl.id)}
                        disabled={setDefault.isPending}
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ─── List View ─── */}
        {!isLoading && templates.length > 0 && viewMode === "list" && (
          <div className="d-flex flex-column gap-2">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="template-list-row"
                onClick={() => handleCardClick(tpl.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  border: "1px solid var(--cui-border-color, #d8dbe0)",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "background 0.15s",
                  background: "var(--cui-body-bg, #fff)",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {tpl.thumbnailUrl ? (
                    <img
                      src={tpl.thumbnailUrl}
                      alt={tpl.name}
                      style={{ width: 36, height: 36, objectFit: "contain" }}
                    />
                  ) : (
                    <Icon name="file-text" size={22} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{tpl.name}</span>
                    {tpl.isDefault && <Badge variant="success">Default</Badge>}
                  </div>
                  {tpl.description && (
                    <p className="text-muted mb-0" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {tpl.description}
                    </p>
                  )}
                </div>

                {/* Type */}
                <Badge variant={getTypeBadgeVariant(tpl.documentType)}>
                  {formatDocType(tpl.documentType)}
                </Badge>

                {/* Actions */}
                <div className="d-flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleCardClick(tpl.id);
                    }}
                  >
                    <Icon name="settings" size={14} /> Customize
                  </Button>
                  {!tpl.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e: React.MouseEvent) => handleSetDefault(e, tpl.id)}
                      disabled={setDefault.isPending}
                    >
                      Set Default
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .template-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
        }
        .template-list-row:hover {
          background: var(--cui-tertiary-bg, #f8f9fa) !important;
        }

        /* Toolbar icon buttons */
        .toolbar-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
          color: var(--cui-body-color, #4f5d73);
          cursor: pointer;
          transition: all 0.15s;
          padding: 0;
        }
        .toolbar-icon-btn:hover {
          background: var(--cui-tertiary-bg, #f0f2f5);
          border-color: var(--cui-border-color, #d8dbe0);
        }
        .toolbar-icon-btn.active {
          background: var(--cui-primary, #321fdb);
          color: #fff;
          border-color: var(--cui-primary, #321fdb);
        }
        .toolbar-icon-btn[style*="color"] {
          width: auto;
          padding: 0 8px;
        }

        /* View mode toggle buttons */
        .toolbar-view-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 30px;
          border: none;
          background: transparent;
          color: var(--cui-body-color, #4f5d73);
          cursor: pointer;
          transition: all 0.15s;
          padding: 0;
        }
        .toolbar-view-btn:hover {
          background: var(--cui-tertiary-bg, #f0f2f5);
        }
        .toolbar-view-btn.active {
          background: var(--cui-primary, #321fdb);
          color: #fff;
        }
        .toolbar-view-btn + .toolbar-view-btn {
          border-left: 1px solid var(--cui-border-color, #d8dbe0);
        }

        /* Filter chips */
        .filter-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border: 1px solid var(--cui-border-color, #d8dbe0);
          border-radius: 16px;
          background: var(--cui-body-bg, #fff);
          color: var(--cui-body-color, #4f5d73);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-chip:hover {
          border-color: var(--cui-primary, #321fdb);
          color: var(--cui-primary, #321fdb);
        }
        .filter-chip.active {
          background: var(--cui-primary, #321fdb);
          border-color: var(--cui-primary, #321fdb);
          color: #fff;
        }
      `}</style>
    </div>
  );
}
