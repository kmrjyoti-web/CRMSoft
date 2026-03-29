"use client";

import { useState } from "react";
import { Button, Card, Input, SelectInput, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCreateTemplate, useUpdateTemplate } from "../hooks/useQuotationTemplates";
import type { QuotationTemplate, TemplateItem, CreateTemplateDto } from "../types/quotation-templates.types";

// ── Types ─────────────────────────────────────────────

interface TemplateFormProps {
  template?: QuotationTemplate;
  onClose: () => void;
}

interface ItemRow {
  productId: string;
  defaultQuantity: number;
  defaultDiscount: number;
  isOptional: boolean;
  notes: string;
}

// ── Helpers ───────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { label: "Standard", value: "STANDARD" },
  { label: "Enterprise", value: "ENTERPRISE" },
  { label: "Startup", value: "STARTUP" },
  { label: "Government", value: "GOVERNMENT" },
  { label: "Custom", value: "CUSTOM" },
];

function emptyItem(): ItemRow {
  return { productId: "", defaultQuantity: 1, defaultDiscount: 0, isOptional: false, notes: "" };
}

function toItemRows(items?: TemplateItem[]): ItemRow[] {
  if (!items || items.length === 0) return [emptyItem()];
  return items.map((it) => ({
    productId: it.productId,
    defaultQuantity: it.defaultQuantity,
    defaultDiscount: it.defaultDiscount ?? 0,
    isOptional: it.isOptional,
    notes: it.notes ?? "",
  }));
}

// ── Component ─────────────────────────────────────────

export function TemplateForm({ template, onClose }: TemplateFormProps) {
  const isEdit = !!template;

  // Form state
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [category, setCategory] = useState(template?.category ?? "");
  const [defaultDiscount, setDefaultDiscount] = useState(String(template?.defaultDiscount ?? ""));
  const [defaultTerms, setDefaultTerms] = useState(template?.defaultTerms ?? "");
  const [defaultNotes, setDefaultNotes] = useState(template?.defaultNotes ?? "");
  const [defaultValidityDays, setDefaultValidityDays] = useState(String(template?.defaultValidityDays ?? ""));
  const [items, setItems] = useState<ItemRow[]>(toItemRows(template?.items));

  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const saving = createMutation.isPending || updateMutation.isPending;

  // ── Item management ─────────────────────────────────
  const addItem = () => {
    setItems((prev) => [...prev, emptyItem()]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof ItemRow, value: string | number | boolean) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  // ── Submit ──────────────────────────────────────────
  const handleSave = () => {
    const dto: CreateTemplateDto = {
      name,
      description: description || undefined,
      category: category || undefined,
      defaultDiscount: defaultDiscount ? Number(defaultDiscount) : undefined,
      defaultTerms: defaultTerms || undefined,
      defaultNotes: defaultNotes || undefined,
      defaultValidityDays: defaultValidityDays ? Number(defaultValidityDays) : undefined,
      items: items
        .filter((it) => it.productId)
        .map((it) => ({
          productId: it.productId,
          defaultQuantity: it.defaultQuantity,
          defaultDiscount: it.defaultDiscount || undefined,
          isOptional: it.isOptional,
          notes: it.notes || undefined,
        })),
    };

    if (isEdit && template) {
      updateMutation.mutate(
        { id: template.id, dto },
        { onSuccess: () => onClose() },
      );
    } else {
      createMutation.mutate(dto, { onSuccess: () => onClose() });
    }
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={isEdit ? "edit" : "plus"} size={18} color="#3b82f6" />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            {isEdit ? "Edit Template" : "Create Template"}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          <Icon name="x" size={14} /> Close
        </Button>
      </div>

      {/* ── Basic Fields ───────────────────────────────── */}
      <Card>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>
            Template Details
          </h3>

          <Input
            label="Name *"
            value={name}
            onChange={(val) => setName(val)}
            leftIcon={<Icon name="file-text" size={16} />}
          />

          <Input
            label="Description"
            value={description}
            onChange={(val) => setDescription(val)}
            leftIcon={<Icon name="align-left" size={16} />}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SelectInput
              label="Category"
              value={category}
              onChange={(val) => setCategory(val as string)}
              options={CATEGORY_OPTIONS}
              leftIcon={<Icon name="tag" size={16} />}
            />
            <Input
              label="Default Discount (%)"
              type="number"
              value={defaultDiscount}
              onChange={(val) => setDefaultDiscount(val)}
              leftIcon={<Icon name="percent" size={16} />}
            />
          </div>

          <Input
            label="Default Terms & Conditions"
            value={defaultTerms}
            onChange={(val) => setDefaultTerms(val)}
            leftIcon={<Icon name="scroll-text" size={16} />}
          />

          <Input
            label="Default Notes"
            value={defaultNotes}
            onChange={(val) => setDefaultNotes(val)}
            leftIcon={<Icon name="sticky-note" size={16} />}
          />

          <Input
            label="Default Validity (Days)"
            type="number"
            value={defaultValidityDays}
            onChange={(val) => setDefaultValidityDays(val)}
            leftIcon={<Icon name="clock" size={16} />}
          />
        </div>
      </Card>

      {/* ── Items Section ──────────────────────────────── */}
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              Template Items
            </h3>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Icon name="plus" size={14} /> Add Item
            </Button>
          </div>

          {/* Items table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>
                    Product ID
                  </th>
                  <th style={{ padding: "8px 10px", textAlign: "right", color: "#64748b", fontWeight: 600, width: 100 }}>
                    Qty
                  </th>
                  <th style={{ padding: "8px 10px", textAlign: "right", color: "#64748b", fontWeight: 600, width: 100 }}>
                    Discount %
                  </th>
                  <th style={{ padding: "8px 10px", textAlign: "center", color: "#64748b", fontWeight: 600, width: 80 }}>
                    Optional
                  </th>
                  <th style={{ padding: "8px 10px", textAlign: "center", color: "#64748b", fontWeight: 600, width: 50 }}>
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "6px 10px" }}>
                      <Input
                        label=""
                        value={item.productId}
                        onChange={(val) => updateItem(idx, "productId", val)}
                        leftIcon={<Icon name="package" size={14} />}
                      />
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <Input
                        label=""
                        type="number"
                        value={String(item.defaultQuantity)}
                        onChange={(val) => updateItem(idx, "defaultQuantity", Number(val) || 1)}
                      />
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <Input
                        label=""
                        type="number"
                        value={String(item.defaultDiscount)}
                        onChange={(val) => updateItem(idx, "defaultDiscount", Number(val) || 0)}
                      />
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={item.isOptional}
                        onChange={(e) => updateItem(idx, "isOptional", e.target.checked)}
                        style={{ width: 16, height: 16, cursor: "pointer" }}
                      />
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(idx)}
                        disabled={items.length <= 1}
                      >
                        <Icon name="trash-2" size={14} color="#ef4444" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* ── Action Buttons ─────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!name || saving}>
          {saving ? (
            <>
              <LoadingSpinner /> Saving...
            </>
          ) : (
            <>
              <Icon name="save" size={16} /> {isEdit ? "Update Template" : "Create Template"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
