/**
 * DynamicField component types.
 * Framework-agnostic.
 * Dispatches form field rendering based on ControlType.
 */

// Import types from existing core models
import type { ControlType, FormFieldConfig, RowConfig, UiConfig } from "../../../core/models";

// Re-export for convenience
export type { ControlType, FormFieldConfig, RowConfig };

// ── Field Type Groups ───────────────────────
export const TEXT_FIELD_TYPES: ControlType[] = [
  "text",
  "number",
  "email",
  "password",
  "textarea",
];

export const SELECT_FIELD_TYPES: ControlType[] = [
  "select",
  "multi-select",
  "autocomplete",
  "aic-autocomplete",
  "tags",
];

export const BOOLEAN_FIELD_TYPES: ControlType[] = [
  "checkbox",
  "switch",
  "toggle-button",
];

export const GROUP_FIELD_TYPES: ControlType[] = [
  "radio-group",
  "checkbox-group",
  "list-checkbox",
  "segment",
];

export const INTERACTIVE_FIELD_TYPES: ControlType[] = [
  "rating",
  "slider",
  "file-upload",
  "signature",
  "color",
  "otp",
  "date",
  "mobile",
  "currency",
];

export const ACTION_FIELD_TYPES: ControlType[] = [
  "button",
  "aic-toolbar",
  "confirm-dialog",
  "alert-dialog",
];

export const CONTAINER_FIELD_TYPES: ControlType[] = ["fieldset"];

// ── DynamicField Props ──────────────────────
export interface DynamicFieldProps {
  field: FormFieldConfig;
  value?: unknown;
  onChange?: (key: string, value: unknown) => void;
  onAction?: (key: string, action: string) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  className?: string;
}

// ── Fieldset Props ──────────────────────────
export type FieldsetAppearance = "legend" | "panel";

export interface FieldsetProps {
  field: FormFieldConfig;
  value?: Record<string, unknown>;
  onChange?: (key: string, value: unknown) => void;
  onAction?: (key: string, action: string) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  className?: string;
}
