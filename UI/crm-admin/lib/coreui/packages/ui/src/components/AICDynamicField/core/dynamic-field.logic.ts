/**
 * DynamicField state logic.
 * Framework-agnostic.
 * Field type classification, validation helpers, and default value resolution.
 */

import type { ControlType, FormFieldConfig } from "./dynamic-field.types";
import {
  TEXT_FIELD_TYPES,
  SELECT_FIELD_TYPES,
  BOOLEAN_FIELD_TYPES,
  GROUP_FIELD_TYPES,
  INTERACTIVE_FIELD_TYPES,
  ACTION_FIELD_TYPES,
  CONTAINER_FIELD_TYPES,
} from "./dynamic-field.types";

// ── Field Type Classification ───────────────
export function getFieldCategory(type: ControlType): string {
  if (TEXT_FIELD_TYPES.includes(type)) return "text";
  if (SELECT_FIELD_TYPES.includes(type)) return "select";
  if (BOOLEAN_FIELD_TYPES.includes(type)) return "boolean";
  if (GROUP_FIELD_TYPES.includes(type)) return "group";
  if (INTERACTIVE_FIELD_TYPES.includes(type)) return "interactive";
  if (ACTION_FIELD_TYPES.includes(type)) return "action";
  if (CONTAINER_FIELD_TYPES.includes(type)) return "container";
  if (type === "editor") return "editor";
  return "unknown";
}

// ── Field Rendering Check ───────────────────
export function isKnownFieldType(type: string): boolean {
  const allTypes: string[] = [
    ...TEXT_FIELD_TYPES,
    ...SELECT_FIELD_TYPES,
    ...BOOLEAN_FIELD_TYPES,
    ...GROUP_FIELD_TYPES,
    ...INTERACTIVE_FIELD_TYPES,
    ...ACTION_FIELD_TYPES,
    ...CONTAINER_FIELD_TYPES,
    "editor",
  ];
  return allTypes.includes(type);
}

// ── Validation Helpers ──────────────────────
export function isFieldRequired(field: FormFieldConfig): boolean {
  return field.validators?.required === true;
}

export function getFieldError(
  field: FormFieldConfig,
  errors?: Record<string, string>,
): string | undefined {
  return errors?.[field.key];
}

// ── Default Value Resolver ──────────────────
export function resolveDefaultValue(field: FormFieldConfig): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;

  switch (field.type) {
    case "checkbox":
    case "switch":
    case "toggle-button":
      return false;
    case "rating":
    case "slider":
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

// ── UI Config Merge ─────────────────────────
export function mergeUiConfig(
  globalConfig: Record<string, string>,
  fieldUi?: Record<string, string>,
): Record<string, string> {
  return { ...globalConfig, ...(fieldUi ?? {}) };
}
