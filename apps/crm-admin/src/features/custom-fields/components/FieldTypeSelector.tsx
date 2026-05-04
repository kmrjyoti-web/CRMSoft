"use client";

import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";
import type { FieldType } from "../types/custom-fields.types";

// ── Icon mapping ────────────────────────────────────────

const FIELD_TYPE_CONFIG: { type: FieldType; label: string; icon: IconName }[] = [
  { type: "TEXT", label: "Text", icon: "type" },
  { type: "TEXTAREA", label: "Text Area", icon: "align-left" },
  { type: "NUMBER", label: "Number", icon: "hash" },
  { type: "DECIMAL", label: "Decimal", icon: "percent" },
  { type: "DATE", label: "Date", icon: "calendar" },
  { type: "DATETIME", label: "Date Time", icon: "clock" },
  { type: "SELECT", label: "Select", icon: "chevron-down" },
  { type: "MULTI_SELECT", label: "Multi Select", icon: "list" },
  { type: "CHECKBOX", label: "Checkbox", icon: "check-square" },
  { type: "RADIO", label: "Radio", icon: "circle" },
  { type: "EMAIL", label: "Email", icon: "mail" },
  { type: "PHONE", label: "Phone", icon: "phone" },
  { type: "URL", label: "URL", icon: "link" },
  { type: "CURRENCY", label: "Currency", icon: "dollar-sign" },
  { type: "LOOKUP", label: "Lookup", icon: "search" },
  { type: "FILE", label: "File", icon: "file" },
];

// ── Props ───────────────────────────────────────────────

interface FieldTypeSelectorProps {
  value: FieldType;
  onChange: (type: FieldType) => void;
}

// ── Component ───────────────────────────────────────────

export function FieldTypeSelector({ value, onChange }: FieldTypeSelectorProps) {
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
        Field Type
      </label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {FIELD_TYPE_CONFIG.map((cfg) => {
          const isSelected = value === cfg.type;
          return (
            <button
              key={cfg.type}
              type="button"
              onClick={() => onChange(cfg.type)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "12px 8px",
                borderRadius: 8,
                border: isSelected
                  ? "2px solid #3b82f6"
                  : "1px solid #e5e7eb",
                background: isSelected ? "#eff6ff" : "#fff",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Icon
                name={cfg.icon}
                size={20}
                color={isSelected ? "#3b82f6" : "#6b7280"}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "#3b82f6" : "#374151",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {cfg.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
