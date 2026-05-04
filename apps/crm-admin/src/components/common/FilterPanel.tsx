"use client";

import { Input, SelectInput, DatePicker, Button, Icon } from "@/components/ui";

import { LookupSelect } from "./LookupSelect";

// ── Types ───────────────────────────────────────────────

interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date-range" | "lookup";
  options?: { label: string; value: string }[];
  masterCode?: string;
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset?: () => void;
}

// ── Component ───────────────────────────────────────────

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
}: FilterPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: 16,
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
      }}
    >
      {filters.map((f) => (
        <div key={f.key}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 500,
              color: "#475569",
              marginBottom: 4,
            }}
          >
            {f.label}
          </label>

          {f.type === "text" && (
            <Input
              value={values[f.key] ?? ""}
              onChange={(v) => onChange(f.key, v)}
              placeholder={f.placeholder ?? `Search ${f.label.toLowerCase()}...`}
              size="sm"
              clearable
            />
          )}

          {f.type === "select" && (
            <SelectInput
              options={f.options ?? []}
              value={values[f.key] ?? null}
              onChange={(v) => onChange(f.key, v)}
              placeholder={f.placeholder ?? `Select ${f.label.toLowerCase()}`}
              searchable
              clearable
            />
          )}

          {f.type === "date-range" && (
            <DatePicker
              value={values[f.key] ?? null}
              onChange={(v) => onChange(f.key, v)}
            />
          )}

          {f.type === "lookup" && f.masterCode && (
            <LookupSelect
              masterCode={f.masterCode}
              value={values[f.key] ?? null}
              onChange={(v) => onChange(f.key, v)}
              placeholder={f.placeholder ?? `Select ${f.label.toLowerCase()}`}
            />
          )}
        </div>
      ))}

      {onReset && (
        <Button size="sm" variant="outline" onClick={onReset}>
          <Icon name="refresh" size={14} />
          <span style={{ marginLeft: 4 }}>Reset</span>
        </Button>
      )}
    </div>
  );
}
