"use client";

import { useState, useEffect, useCallback } from "react";

import {
  Icon,
  Button,
  Modal,
  Input,
  SelectInput,
  NumberInput,
  Switch,
} from "@/components/ui";

import { FieldTypeSelector } from "./FieldTypeSelector";
import { FieldPreview } from "./FieldPreview";

import { useCreateField, useUpdateField } from "../hooks/useCustomFields";

import type {
  CustomField,
  FieldType,
  EntityTypeForFields,
  CreateCustomFieldDto,
} from "../types/custom-fields.types";

// ── Helpers ─────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const ENTITY_TYPE_OPTIONS = [
  { label: "Lead", value: "lead" },
  { label: "Contact", value: "contact" },
  { label: "Organization", value: "organization" },
  { label: "Quotation", value: "quotation" },
  { label: "Product", value: "product" },
];

const COLUMN_WIDTH_OPTIONS = [
  { label: "Full Width", value: "FULL" },
  { label: "Half Width", value: "HALF" },
  { label: "Third Width", value: "THIRD" },
];

const TYPES_WITH_OPTIONS: FieldType[] = ["SELECT", "MULTI_SELECT", "RADIO"];
const TYPES_WITH_NUMERIC_RANGE: FieldType[] = ["NUMBER", "DECIMAL", "CURRENCY"];
const TYPES_WITH_TEXT_RANGE: FieldType[] = ["TEXT"];

// ── Props ───────────────────────────────────────────────

interface CustomFieldFormProps {
  field?: CustomField;
  open: boolean;
  onClose: () => void;
  defaultEntityType?: EntityTypeForFields;
}

// ── Component ───────────────────────────────────────────

export function CustomFieldForm({
  field,
  open,
  onClose,
  defaultEntityType,
}: CustomFieldFormProps) {
  const isEdit = !!field;

  // ── State ───────────────────────────────────────────

  const [entityType, setEntityType] = useState<EntityTypeForFields>(
    field?.entityType ?? defaultEntityType ?? "lead",
  );
  const [fieldLabel, setFieldLabel] = useState(field?.fieldLabel ?? "");
  const [fieldName, setFieldName] = useState(field?.fieldName ?? "");
  const [description, setDescription] = useState(field?.description ?? "");
  const [fieldType, setFieldType] = useState<FieldType>(
    field?.fieldType ?? "TEXT",
  );
  const [isRequired, setIsRequired] = useState(field?.isRequired ?? false);
  const [isUnique, setIsUnique] = useState(field?.isUnique ?? false);
  const [isVisibleInList, setIsVisibleInList] = useState(
    field?.isVisibleInList ?? true,
  );
  const [isSearchable, setIsSearchable] = useState(
    field?.isSearchable ?? false,
  );
  const [placeholder, setPlaceholder] = useState(field?.placeholder ?? "");
  const [section, setSection] = useState(field?.section ?? "");
  const [columnWidth, setColumnWidth] = useState<"FULL" | "HALF" | "THIRD">(
    field?.columnWidth ?? "FULL",
  );
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    field?.options ?? [{ value: "", label: "" }],
  );
  const [minValue, setMinValue] = useState<number | null>(
    field?.minValue ?? null,
  );
  const [maxValue, setMaxValue] = useState<number | null>(
    field?.maxValue ?? null,
  );
  const [minLength, setMinLength] = useState<number | null>(
    field?.minLength ?? null,
  );
  const [maxLength, setMaxLength] = useState<number | null>(
    field?.maxLength ?? null,
  );

  const [showPreview, setShowPreview] = useState(false);

  // ── Mutations ─────────────────────────────────────────

  const createField = useCreateField();
  const updateField = useUpdateField();

  const isSaving = createField.isPending || updateField.isPending;

  // ── Auto-slugify label → name ─────────────────────────

  useEffect(() => {
    if (!isEdit) {
      setFieldName(slugify(fieldLabel));
    }
  }, [fieldLabel, isEdit]);

  // ── Reset on open ─────────────────────────────────────

  useEffect(() => {
    if (open && !field) {
      setEntityType(defaultEntityType ?? "lead");
      setFieldLabel("");
      setFieldName("");
      setDescription("");
      setFieldType("TEXT");
      setIsRequired(false);
      setIsUnique(false);
      setIsVisibleInList(true);
      setIsSearchable(false);
      setPlaceholder("");
      setSection("");
      setColumnWidth("FULL");
      setOptions([{ value: "", label: "" }]);
      setMinValue(null);
      setMaxValue(null);
      setMinLength(null);
      setMaxLength(null);
      setShowPreview(false);
    }
  }, [open, field, defaultEntityType]);

  // ── Options management ────────────────────────────────

  const addOption = useCallback(() => {
    setOptions((prev) => [...prev, { value: "", label: "" }]);
  }, []);

  const removeOption = useCallback((index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateOption = useCallback(
    (index: number, key: "value" | "label", val: string) => {
      setOptions((prev) =>
        prev.map((o, i) => (i === index ? { ...o, [key]: val } : o)),
      );
    },
    [],
  );

  // ── Submit ────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    const dto: CreateCustomFieldDto = {
      entityType,
      fieldName,
      fieldLabel,
      fieldType,
      description: description || undefined,
      placeholder: placeholder || undefined,
      isRequired,
      isUnique,
      isVisibleInList,
      isSearchable,
      section: section || undefined,
      columnWidth,
    };

    if (TYPES_WITH_OPTIONS.includes(fieldType)) {
      dto.options = options.filter((o) => o.value && o.label);
    }
    if (TYPES_WITH_NUMERIC_RANGE.includes(fieldType)) {
      dto.minValue = minValue ?? undefined;
      dto.maxValue = maxValue ?? undefined;
    }
    if (TYPES_WITH_TEXT_RANGE.includes(fieldType)) {
      dto.minLength = minLength ?? undefined;
      dto.maxLength = maxLength ?? undefined;
    }

    if (isEdit && field) {
      updateField.mutate(
        { id: field.id, dto },
        { onSuccess: () => onClose() },
      );
    } else {
      createField.mutate(dto, { onSuccess: () => onClose() });
    }
  }, [
    entityType, fieldName, fieldLabel, fieldType, description,
    placeholder, isRequired, isUnique, isVisibleInList, isSearchable,
    section, columnWidth, options, minValue, maxValue, minLength,
    maxLength, isEdit, field, createField, updateField, onClose,
  ]);

  // ── Build preview object ──────────────────────────────

  const previewField: CustomField = {
    id: field?.id ?? "preview",
    entityType,
    fieldName,
    fieldLabel: fieldLabel || "Untitled Field",
    fieldType,
    description,
    placeholder,
    options: TYPES_WITH_OPTIONS.includes(fieldType)
      ? options.filter((o) => o.value && o.label)
      : undefined,
    isRequired,
    isUnique,
    isVisibleInList,
    isSearchable,
    isActive: true,
    isSystemField: false,
    sortOrder: field?.sortOrder ?? 0,
    section,
    columnWidth,
    minLength: minLength ?? undefined,
    maxLength: maxLength ?? undefined,
    minValue: minValue ?? undefined,
    maxValue: maxValue ?? undefined,
    createdAt: field?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // ── Render ────────────────────────────────────────────

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Custom Field" : "Create Custom Field"}
      size="lg"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20 }}>
        {/* Entity Type */}
        <SelectInput
          label="Entity Type"
          leftIcon={<Icon name="database" size={16} />}
          options={ENTITY_TYPE_OPTIONS}
          value={entityType}
          onChange={(v) => setEntityType(v as EntityTypeForFields)}
          disabled={!!defaultEntityType || isEdit}
        />

        {/* Label & Name */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input
            label="Field Label"
            leftIcon={<Icon name="tag" size={16} />}
            placeholder="Display Name"
            value={fieldLabel}
            onChange={(v) => setFieldLabel(v as string)}
            required
          />
          <Input
            label="Field Name"
            leftIcon={<Icon name="code" size={16} />}
            placeholder="system_name"
            value={fieldName}
            onChange={(v) => setFieldName(v as string)}
            disabled={isEdit}
            required
          />
        </div>

        {/* Description */}
        <Input
          label="Description"
          leftIcon={<Icon name="align-left" size={16} />}
          placeholder="Optional description for this field"
          value={description}
          onChange={(v) => setDescription(v as string)}
        />

        {/* Field Type Selector */}
        <FieldTypeSelector value={fieldType} onChange={setFieldType} />

        {/* Toggles row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            padding: 12,
            background: "#f9fafb",
            borderRadius: 8,
          }}
        >
          <Switch
            label="Required"
            checked={isRequired}
            onChange={() => setIsRequired((v) => !v)}
          />
          <Switch
            label="Unique"
            checked={isUnique}
            onChange={() => setIsUnique((v) => !v)}
          />
          <Switch
            label="Show in List"
            checked={isVisibleInList}
            onChange={() => setIsVisibleInList((v) => !v)}
          />
          <Switch
            label="Searchable"
            checked={isSearchable}
            onChange={() => setIsSearchable((v) => !v)}
          />
        </div>

        {/* Placeholder */}
        <Input
          label="Placeholder"
          leftIcon={<Icon name="type" size={16} />}
          placeholder="Placeholder text..."
          value={placeholder}
          onChange={(v) => setPlaceholder(v as string)}
        />

        {/* Section & Column Width */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input
            label="Section"
            leftIcon={<Icon name="layout" size={16} />}
            placeholder="Form section name"
            value={section}
            onChange={(v) => setSection(v as string)}
          />
          <SelectInput
            label="Column Width"
            leftIcon={<Icon name="columns" size={16} />}
            options={COLUMN_WIDTH_OPTIONS}
            value={columnWidth}
            onChange={(v) => setColumnWidth(v as "FULL" | "HALF" | "THIRD")}
          />
        </div>

        {/* Options for SELECT / MULTI_SELECT / RADIO */}
        {TYPES_WITH_OPTIONS.includes(fieldType) && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Options
              </span>
              <Button variant="outline" size="sm" onClick={addOption}>
                <Icon name="plus" size={14} />
                Add Option
              </Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <Input
                    label="Value"
                    placeholder="option_value"
                    value={opt.value}
                    onChange={(v) => updateOption(idx, "value", v as string)}
                  />
                  <Input
                    label="Label"
                    placeholder="Display Label"
                    value={opt.label}
                    onChange={(v) => updateOption(idx, "label", v as string)}
                  />
                  {options.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(idx)}
                    >
                      <Icon name="x" size={14} color="#ef4444" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Numeric range for NUMBER / DECIMAL / CURRENCY */}
        {TYPES_WITH_NUMERIC_RANGE.includes(fieldType) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <NumberInput
              label="Min Value"
              placeholder="Minimum"
              value={minValue}
              onChange={(v) => setMinValue(v as number | null)}
            />
            <NumberInput
              label="Max Value"
              placeholder="Maximum"
              value={maxValue}
              onChange={(v) => setMaxValue(v as number | null)}
            />
          </div>
        )}

        {/* Text length for TEXT */}
        {TYPES_WITH_TEXT_RANGE.includes(fieldType) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <NumberInput
              label="Min Length"
              placeholder="Minimum chars"
              value={minLength}
              onChange={(v) => setMinLength(v as number | null)}
            />
            <NumberInput
              label="Max Length"
              placeholder="Maximum chars"
              value={maxLength}
              onChange={(v) => setMaxLength(v as number | null)}
            />
          </div>
        )}

        {/* Preview toggle */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
          >
            <Icon name="eye" size={14} />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          {showPreview && (
            <div style={{ marginTop: 12 }}>
              <FieldPreview field={previewField} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            borderTop: "1px solid #e5e7eb",
            paddingTop: 16,
          }}
        >
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!fieldLabel || !fieldName || isSaving}
          >
            <Icon name={isEdit ? "check" : "plus"} size={14} />
            {isSaving ? "Saving..." : isEdit ? "Update Field" : "Create Field"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
