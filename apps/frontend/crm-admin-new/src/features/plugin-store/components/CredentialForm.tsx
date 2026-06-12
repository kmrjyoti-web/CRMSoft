"use client";

import { useState } from "react";

import { Button, Icon, Input } from "@/components/ui";

import type { PluginConfigField } from "../types/plugin-store.types";

// ── Props ────────────────────────────────────────────────────────────

interface CredentialFormProps {
  fields: PluginConfigField[];
  initialValues?: Record<string, string>;
  onSubmit: (credentials: Record<string, string>) => Promise<void>;
  submitLabel?: string;
  isUpdate?: boolean;
}

// ── Icon mapping ─────────────────────────────────────────────────────

function fieldIcon(type: PluginConfigField["type"]): string {
  switch (type) {
    case "secret":
      return "lock";
    case "url":
      return "link";
    case "email":
      return "mail";
    case "number":
      return "hash";
    case "boolean":
      return "toggle-left";
    default:
      return "key";
  }
}

// ── Component ────────────────────────────────────────────────────────

export function CredentialForm({
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Save Credentials",
  isUpdate = false,
}: CredentialFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) {
      init[f.name] = initialValues[f.name] ?? (f.default != null ? String(f.default) : "");
    }
    return init;
  });
  const [loading, setLoading] = useState(false);

  const isValid = fields
    .filter((f) => f.required)
    .every((f) => values[f.name]?.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  if (fields.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "#9ca3af",
          background: "#f9fafb",
          borderRadius: 8,
        }}
      >
        <Icon name="check-circle" size={32} color="#16a34a" />
        <p style={{ margin: "8px 0 0", fontSize: 14 }}>
          No credentials required for this plugin.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {isUpdate && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            fontSize: 13,
            color: "#92400e",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="alert-triangle" size={16} color="#d97706" />
          Updating credentials will reset the error counter.
        </div>
      )}

      {fields.map((field) => (
        <Input
          key={field.name}
          label={field.label + (field.required ? " *" : "")}
          value={values[field.name] ?? ""}
          onChange={(v) => updateField(field.name, v)}
          type={field.type === "secret" ? "password" : "text"}
          leftIcon={<Icon name={fieldIcon(field.type)} size={16} />}
          placeholder={field.placeholder}
        />
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
        <Button variant="primary" type="submit" disabled={!isValid || loading}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="save" size={14} />
            {loading ? "Saving…" : submitLabel}
          </span>
        </Button>
      </div>
    </form>
  );
}
