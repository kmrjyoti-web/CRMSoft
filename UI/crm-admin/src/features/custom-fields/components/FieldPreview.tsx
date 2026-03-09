"use client";

import {
  Icon,
  Input,
  NumberInput,
  DatePicker,
  SelectInput,
  Switch,
} from "@/components/ui";
import type { CustomField } from "../types/custom-fields.types";

// ── Props ───────────────────────────────────────────────

interface FieldPreviewProps {
  field: CustomField;
}

// ── Component ───────────────────────────────────────────

export function FieldPreview({ field }: FieldPreviewProps) {
  const label = field.fieldLabel + (field.isRequired ? " *" : "");
  const placeholder = field.placeholder || `Enter ${field.fieldLabel.toLowerCase()}...`;

  const options =
    field.options?.map((o) => ({ label: o.label, value: o.value })) ?? [];

  function renderField() {
    switch (field.fieldType) {
      case "TEXT":
        return (
          <Input
            label={label}
            leftIcon={<Icon name="type" size={16} />}
            placeholder={placeholder}
            value={(field.defaultValue as string) ?? ""}
            readOnly
          />
        );

      case "EMAIL":
        return (
          <Input
            label={label}
            leftIcon={<Icon name="mail" size={16} />}
            placeholder={placeholder}
            value={(field.defaultValue as string) ?? ""}
            readOnly
          />
        );

      case "PHONE":
        return (
          <Input
            label={label}
            leftIcon={<Icon name="phone" size={16} />}
            placeholder={placeholder}
            value={(field.defaultValue as string) ?? ""}
            readOnly
          />
        );

      case "URL":
        return (
          <Input
            label={label}
            leftIcon={<Icon name="link" size={16} />}
            placeholder={placeholder}
            value={(field.defaultValue as string) ?? ""}
            readOnly
          />
        );

      case "TEXTAREA":
        return (
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              {label}
            </label>
            <textarea
              placeholder={placeholder}
              defaultValue={(field.defaultValue as string) ?? ""}
              readOnly
              rows={3}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                fontSize: 14,
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>
        );

      case "NUMBER":
      case "DECIMAL":
      case "CURRENCY":
        return (
          <NumberInput
            label={label}
            placeholder={placeholder}
            value={(field.defaultValue as number) ?? undefined}
            readOnly
          />
        );

      case "DATE":
      case "DATETIME":
        return (
          <DatePicker
            label={label}
            value={null}
            readOnly
          />
        );

      case "SELECT":
      case "LOOKUP":
        return (
          <SelectInput
            label={label}
            options={options}
            value={null}
            placeholder={placeholder}
            leftIcon={
              <Icon
                name={field.fieldType === "LOOKUP" ? "search" : "chevron-down"}
                size={16}
              />
            }
            readOnly
          />
        );

      case "MULTI_SELECT":
        return (
          <SelectInput
            label={label}
            options={options}
            value={null}
            placeholder={placeholder}
            leftIcon={<Icon name="list" size={16} />}
            readOnly
          />
        );

      case "CHECKBOX":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Switch
              checked={!!field.defaultValue}
              label={label}
            />
          </div>
        );

      case "RADIO":
        return (
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              {label}
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {options.length > 0 ? (
                options.map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={`preview_${field.fieldName}`}
                      value={opt.value}
                      defaultChecked={field.defaultValue === opt.value}
                      readOnly
                    />
                    {opt.label}
                  </label>
                ))
              ) : (
                <span style={{ fontSize: 13, color: "#9ca3af" }}>
                  No options defined
                </span>
              )}
            </div>
          </div>
        );

      case "FILE":
        return (
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              {label}
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 16px",
                borderRadius: 8,
                border: "2px dashed #d1d5db",
                background: "#f9fafb",
                cursor: "pointer",
              }}
            >
              <Icon name="file" size={32} color="#9ca3af" />
              <span
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                Click or drag file to upload
              </span>
            </div>
          </div>
        );

      default:
        return (
          <Input
            label={label}
            placeholder={placeholder}
            value=""
            readOnly
          />
        );
    }
  }

  return (
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
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Icon name="eye" size={16} color="#6b7280" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
          Field Preview
        </span>
      </div>
      <div>{renderField()}</div>
      {field.description && (
        <p
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#9ca3af",
            fontStyle: "italic",
          }}
        >
          {field.description}
        </p>
      )}
    </div>
  );
}
