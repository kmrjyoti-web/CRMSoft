"use client";

import { useState, useMemo } from "react";
import { Button, Card, Badge, Input, SelectInput, Modal, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useQuotationTemplates } from "../hooks/useQuotationTemplates";
import type { QuotationTemplate, TemplateFilters } from "../types/quotation-templates.types";

// ── Types ─────────────────────────────────────────────

interface TemplateSelectorProps {
  onSelect: (template: QuotationTemplate) => void;
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

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [preview, setPreview] = useState<QuotationTemplate | null>(null);

  const filters: TemplateFilters = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
    }),
    [search, category],
  );

  const { data: templatesRaw, isLoading } = useQuotationTemplates(filters);

  const templates: QuotationTemplate[] = useMemo(() => {
    const raw = templatesRaw as any;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  }, [templatesRaw]);

  const handleUseTemplate = (tpl: QuotationTemplate) => {
    onSelect(tpl);
    setOpen(false);
    setPreview(null);
  };

  return (
    <>
      {/* ── Trigger Button ─────────────────────────────── */}
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Icon name="layout-template" size={16} /> Use Template
      </Button>

      {/* ── Selector Modal ─────────────────────────────── */}
      <Modal open={open} onClose={() => { setOpen(false); setPreview(null); }} title="Select Quotation Template" size="lg">
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Filters */}
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
                leftIcon={<Icon name="filter" size={16} />}
              />
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
              <LoadingSpinner />
            </div>
          )}

          {/* No preview - show list */}
          {!isLoading && !preview && (
            <>
              {templates.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32 }}>
                  <Icon name="layout-template" size={32} color="#cbd5e1" />
                  <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>No templates found</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        transition: "border-color 0.15s ease",
                      }}
                      onClick={() => setPreview(tpl)}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: "#eff6ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="file-text" size={18} color="#3b82f6" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                          {tpl.name}
                        </div>
                        {tpl.description && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                              marginTop: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 320,
                            }}
                          >
                            {tpl.description}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {tpl.category && <Badge variant="primary">{tpl.category}</Badge>}
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          {tpl.items.length} item{tpl.items.length !== 1 ? "s" : ""}
                        </span>
                        <Icon name="chevron-right" size={16} color="#94a3b8" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Preview mode */}
          {preview && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Back button */}
              <Button variant="ghost" size="sm" onClick={() => setPreview(null)} style={{ alignSelf: "flex-start" }}>
                <Icon name="arrow-left" size={14} /> Back to list
              </Button>

              {/* Template info */}
              <Card>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                      {preview.name}
                    </h3>
                    {preview.category && <Badge variant="primary">{preview.category}</Badge>}
                  </div>
                  {preview.description && (
                    <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px 0" }}>
                      {preview.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#64748b" }}>
                    {preview.defaultDiscount != null && preview.defaultDiscount > 0 && (
                      <span><Icon name="percent" size={12} /> Discount: {preview.defaultDiscount}%</span>
                    )}
                    {preview.defaultValidityDays && (
                      <span><Icon name="clock" size={12} /> Validity: {preview.defaultValidityDays} days</span>
                    )}
                    <span><Icon name="bar-chart-2" size={12} /> Used {preview.usageCount} times</span>
                  </div>
                </div>
              </Card>

              {/* Items preview */}
              <Card>
                <div style={{ padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: "0 0 10px 0" }}>
                    Template Items ({preview.items.length})
                  </h4>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                          <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>Product</th>
                          <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>SKU</th>
                          <th style={{ padding: "8px 10px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>Qty</th>
                          <th style={{ padding: "8px 10px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>Discount</th>
                          <th style={{ padding: "8px 10px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>Optional</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.items.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "8px 10px", fontWeight: 500, color: "#1e293b" }}>
                              {item.productName}
                            </td>
                            <td style={{ padding: "8px 10px", color: "#64748b" }}>
                              {item.productSku}
                            </td>
                            <td style={{ padding: "8px 10px", textAlign: "right", color: "#334155" }}>
                              {item.defaultQuantity}
                            </td>
                            <td style={{ padding: "8px 10px", textAlign: "right", color: "#f59e0b", fontWeight: 500 }}>
                              {item.defaultDiscount ? `${item.defaultDiscount}%` : "-"}
                            </td>
                            <td style={{ padding: "8px 10px", textAlign: "center" }}>
                              {item.isOptional ? (
                                <Badge variant="warning">Optional</Badge>
                              ) : (
                                <Badge variant="secondary">Required</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              {/* Terms / Notes preview */}
              {(preview.defaultTerms || preview.defaultNotes) && (
                <Card>
                  <div style={{ padding: 16 }}>
                    {preview.defaultTerms && (
                      <div style={{ marginBottom: preview.defaultNotes ? 10 : 0 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: "0 0 4px 0" }}>
                          Terms & Conditions
                        </h4>
                        <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.5 }}>
                          {preview.defaultTerms}
                        </p>
                      </div>
                    )}
                    {preview.defaultNotes && (
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: "0 0 4px 0" }}>
                          Notes
                        </h4>
                        <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.5 }}>
                          {preview.defaultNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Use Template button */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button variant="outline" onClick={() => setPreview(null)}>
                  Back
                </Button>
                <Button variant="primary" onClick={() => handleUseTemplate(preview)}>
                  <Icon name="check" size={16} /> Use Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
