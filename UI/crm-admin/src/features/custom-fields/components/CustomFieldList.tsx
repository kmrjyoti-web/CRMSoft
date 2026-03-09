"use client";

import { useState, useMemo, useCallback } from "react";

import { Icon, Button, Badge, Modal } from "@/components/ui";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

import { CustomFieldForm } from "./CustomFieldForm";
import { FieldPreview } from "./FieldPreview";

import {
  useCustomFields,
  useDeleteField,
} from "../hooks/useCustomFields";

import type {
  CustomField,
  EntityTypeForFields,
  FieldType,
} from "../types/custom-fields.types";

// ── Constants ───────────────────────────────────────────

const ENTITY_TABS: { key: EntityTypeForFields; label: string; icon: string }[] =
  [
    { key: "lead", label: "Lead", icon: "target" },
    { key: "contact", label: "Contact", icon: "users" },
    { key: "organization", label: "Organization", icon: "building" },
    { key: "quotation", label: "Quotation", icon: "file-text" },
    { key: "product", label: "Product", icon: "box" },
  ];

const TYPE_BADGE_COLOR: Record<string, "primary" | "success" | "warning" | "danger" | "secondary"> = {
  TEXT: "primary",
  TEXTAREA: "primary",
  NUMBER: "success",
  DECIMAL: "success",
  DATE: "warning",
  DATETIME: "warning",
  SELECT: "secondary",
  MULTI_SELECT: "secondary",
  CHECKBOX: "danger",
  RADIO: "danger",
  EMAIL: "primary",
  PHONE: "primary",
  URL: "primary",
  CURRENCY: "success",
  LOOKUP: "secondary",
  FILE: "warning",
};

// ── Component ───────────────────────────────────────────

export function CustomFieldList() {
  const [activeTab, setActiveTab] = useState<EntityTypeForFields>("lead");
  const [formOpen, setFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>();
  const [previewField, setPreviewField] = useState<CustomField | null>(null);

  const { data, isLoading } = useCustomFields(activeTab);
  const deleteField = useDeleteField();

  const fields = useMemo(() => {
    const raw = data?.data ?? data;
    return (Array.isArray(raw) ? raw : []) as CustomField[];
  }, [data]);

  const handleEdit = useCallback((field: CustomField) => {
    setEditingField(field);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to delete this field?")) {
        deleteField.mutate(id);
      }
    },
    [deleteField],
  );

  const handleCreate = useCallback(() => {
    setEditingField(undefined);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingField(undefined);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Custom Fields"
        subtitle="Manage custom field definitions for each entity type"
        actions={
          <Button onClick={handleCreate}>
            <Icon name="plus" size={14} />
            Add Field
          </Button>
        }
      />

      {/* Entity Type Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 0,
        }}
      >
        {ENTITY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? "#3b82f6" : "#6b7280",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              background: "none",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              borderBottomColor:
                activeTab === tab.key ? "#3b82f6" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Icon
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? "#3b82f6" : "#9ca3af"}
            />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>
          Loading fields...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && fields.length === 0 && (
        <EmptyState
          icon="sliders"
          title={`No Custom Fields for ${ENTITY_TABS.find((t) => t.key === activeTab)?.label ?? activeTab}`}
          description="Create custom fields to extend this entity with additional data."
          action={{ label: "Create First Field", onClick: handleCreate }}
        />
      )}

      {/* Fields Table */}
      {!isLoading && fields.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Label", "Name", "Type", "Required", "In List", "Section", "Order", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr
                  key={field.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "10px 14px", fontSize: 14, fontWeight: 500 }}>
                    {field.fieldLabel}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#6b7280",
                      fontFamily: "monospace",
                    }}
                  >
                    {field.fieldName}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge variant={TYPE_BADGE_COLOR[field.fieldType] ?? "secondary"}>
                      {field.fieldType}
                    </Badge>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {field.isRequired ? (
                      <Icon name="check" size={16} color="#22c55e" />
                    ) : (
                      <Icon name="minus" size={16} color="#d1d5db" />
                    )}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {field.isVisibleInList ? (
                      <Icon name="check" size={16} color="#22c55e" />
                    ) : (
                      <Icon name="minus" size={16} color="#d1d5db" />
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    {field.section || "\u2014"}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    {field.sortOrder}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewField(field)}
                        title="Preview"
                      >
                        <Icon name="eye" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(field)}
                        title="Edit"
                      >
                        <Icon name="edit" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(field.id)}
                        title="Delete"
                      >
                        <Icon name="trash-2" size={14} color="#ef4444" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <CustomFieldForm
        field={editingField}
        open={formOpen}
        onClose={handleCloseForm}
        defaultEntityType={activeTab}
      />

      {/* Preview Modal */}
      <Modal
        open={!!previewField}
        onClose={() => setPreviewField(null)}
        title={`Preview: ${previewField?.fieldLabel ?? ""}`}
        size="sm"
      >
        <div style={{ padding: 20 }}>
          {previewField && <FieldPreview field={previewField} />}
        </div>
      </Modal>
    </div>
  );
}
