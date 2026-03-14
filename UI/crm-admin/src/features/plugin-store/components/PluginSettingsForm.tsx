"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Button, Icon, Input, SelectInput, Switch } from "@/components/ui";

import { useUpdatePluginSettings } from "../hooks/usePluginStore";
import type { PluginSettingField } from "../types/plugin-store.types";

// ── Props ────────────────────────────────────────────────────────────

interface PluginSettingsFormProps {
  pluginCode: string;
  fields: PluginSettingField[];
  currentSettings?: Record<string, unknown>;
}

// ── Component ────────────────────────────────────────────────────────

export function PluginSettingsForm({
  pluginCode,
  fields,
  currentSettings = {},
}: PluginSettingsFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const f of fields) {
      init[f.key] = currentSettings[f.key] ?? f.defaultValue ?? "";
    }
    return init;
  });

  const updateMutation = useUpdatePluginSettings();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ code: pluginCode, dto: { settings: values } });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const updateField = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  if (fields.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
        No configurable settings for this plugin.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {fields.map((field) => {
        if (field.type === "boolean") {
          return (
            <div key={field.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Switch
                checked={values[field.key] === true}
                onChange={(checked) => updateField(field.key, checked)}
              />
              <span style={{ fontSize: 14, color: "#374151" }}>{field.label}</span>
            </div>
          );
        }

        if (field.type === "select" && field.options) {
          return (
            <SelectInput
              key={field.key}
              label={field.label}
              value={values[field.key] as string}
              onChange={(v) => updateField(field.key, v)}
              options={field.options.map((o) => ({ label: o.label, value: o.value }))}
              leftIcon={<Icon name="settings" size={16} />}
            />
          );
        }

        return (
          <Input
            key={field.key}
            label={field.label}
            value={String(values[field.key] ?? "")}
            onChange={(v) => updateField(field.key, field.type === "number" ? Number(v) || 0 : v)}
            type={field.type === "number" ? "number" : "text"}
            leftIcon={<Icon name="settings" size={16} />}
          />
        );
      })}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="save" size={14} />
            {updateMutation.isPending ? "Saving…" : "Save Settings"}
          </span>
        </Button>
      </div>
    </div>
  );
}
