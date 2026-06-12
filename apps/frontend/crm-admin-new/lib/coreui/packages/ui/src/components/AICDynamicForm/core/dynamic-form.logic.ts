/**
 * DynamicForm state logic.
 * Framework-agnostic.
 * Field extraction, initial values, validation, and tab helpers.
 */

import type { FormSchema, RowConfig, TabConfig } from "./dynamic-form.types";
import type { FormFieldConfig } from "../../../core/models";

// ── Extract All Fields From Schema ──────────
export function extractAllFields(schema: FormSchema): FormFieldConfig[] {
  const fields: FormFieldConfig[] = [];

  const processRows = (rows: RowConfig[]) => {
    for (const row of rows) {
      for (const col of row.columns) {
        if (col.field) {
          fields.push(col.field);
          // Recurse into fieldset
          if (col.field.type === "fieldset" && col.field.props?.["rows"]) {
            processRows(col.field.props["rows"] as RowConfig[]);
          }
        }
      }
    }
  };

  if (schema.rows) processRows(schema.rows);
  if (schema.tabs) {
    for (const tab of schema.tabs) {
      processRows(tab.rows);
    }
  }

  return fields;
}

// ── Build Initial Values ────────────────────
export function buildInitialValues(
  schema: FormSchema,
): Record<string, unknown> {
  const fields = extractAllFields(schema);
  const values: Record<string, unknown> = {};

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      values[field.key] = field.defaultValue;
    } else {
      values[field.key] = getDefaultForType(field.type);
    }
  }

  return values;
}

function getDefaultForType(type: string): unknown {
  switch (type) {
    case "checkbox":
    case "switch":
    case "toggle-button":
      return false;
    case "rating":
    case "slider":
    case "number":
      return 0;
    case "tags":
    case "multi-select":
    case "checkbox-group":
    case "list-checkbox":
      return [];
    default:
      return "";
  }
}

// ── Validation ──────────────────────────────
export function validateForm(
  schema: FormSchema,
  values: Record<string, unknown>,
): Record<string, string> {
  const fields = extractAllFields(schema);
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (field.validators?.required) {
      const val = values[field.key];
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        errors[field.key] = `${field.label} is required`;
      }
    }
    if (field.validators?.minLength) {
      const val = String(values[field.key] ?? "");
      if (val.length > 0 && val.length < field.validators.minLength) {
        errors[field.key] =
          `${field.label} must be at least ${field.validators.minLength} characters`;
      }
    }
    if (field.validators?.maxLength) {
      const val = String(values[field.key] ?? "");
      if (val.length > field.validators.maxLength) {
        errors[field.key] =
          `${field.label} must be at most ${field.validators.maxLength} characters`;
      }
    }
  }

  return errors;
}

// ── Tab Helpers ─────────────────────────────
export function getVisibleRows(
  schema: FormSchema,
  activeTabId: string | null,
): RowConfig[] {
  if (schema.layout === "tabs" && schema.tabs) {
    const tab = schema.tabs.find((t) => t.id === activeTabId);
    return tab ? tab.rows : [];
  }
  return schema.rows ?? [];
}

export function getFirstTabId(schema: FormSchema): string | null {
  if (schema.layout === "tabs" && schema.tabs && schema.tabs.length > 0) {
    return schema.tabs[0].id;
  }
  return null;
}

export function isTabLayout(schema: FormSchema): boolean {
  return schema.layout === "tabs";
}
