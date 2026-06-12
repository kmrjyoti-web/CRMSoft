// Pure TypeScript — no framework imports
// Source: core/ui-kit/angular/src/lib/control-library/models/form-schema.model.ts

import { z } from "zod";
import type { IconName } from "./icon.types";
import { ICON_NAMES } from "./icon.types";
import type { ControlSize, UiConfig } from "./ui-config.types";
import { ControlSizeSchema, UiConfigSchema } from "./ui-config.types";

// ── ControlType (exactly 34 values) ─────────────────────

export const CONTROL_TYPES = [
  "text",
  "number",
  "email",
  "password",
  "textarea",
  "select",
  "multi-select",
  "checkbox",
  "radio",
  "date",
  "mobile",
  "currency",
  "radio-group",
  "checkbox-group",
  "list-checkbox",
  "switch",
  "color",
  "editor",
  "toggle-button",
  "button",
  "autocomplete",
  "aic-autocomplete",
  "rating",
  "slider",
  "tags",
  "segment",
  "file-upload",
  "signature",
  "otp",
  "fieldset",
  "confirm-dialog",
  "alert-dialog",
  "table",
  "aic-toolbar",
] as const;

export type ControlType = (typeof CONTROL_TYPES)[number];

// ── SuffixAction ────────────────────────────────────────

export type SuffixAction =
  | "toggleVisibility"
  | "clear"
  | "search"
  | "calendar";

// ── Interfaces ──────────────────────────────────────────

export interface ValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number | string;
  max?: number | string;
  email?: boolean;
}

export interface ApiConfig {
  endpoint: string;
  method?: "GET" | "POST";
  labelKey: string;
  valueKey: string;
  dependency?: string;
  paramKey?: string;
}

export interface Option {
  label: string;
  value: string | number | boolean;
  icon?: IconName;
  image?: string;
  description?: string;
  command?: string;
}

export interface TransliterationConfig {
  enabled: boolean;
  languages?: { code: string; label: string }[] | string[];
  defaultLanguage?: string;
  showControls?: boolean;
  autoConvert?: boolean;
}

export interface FormFieldConfig {
  key: string;
  type: ControlType;
  label: string;
  placeholder?: string;
  defaultValue?: unknown;
  options?: Option[];
  api?: ApiConfig;
  validators?: ValidationConfig;
  hidden?: boolean;
  props?: Record<string, unknown>;

  // Icon & Action Configuration
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  suffixAction?: SuffixAction;

  // Transliteration
  transliteration?: TransliterationConfig;

  // Visuals
  size?: ControlSize;
  tooltip?: string;

  // Keyboard Navigation
  previousControl?: string;
  nextControl?: string;

  // Allow overriding global UI config for this specific field
  ui?: Partial<UiConfig>;
}

export interface ColumnConfig {
  span: string;
  field: FormFieldConfig;
}

export interface RowConfig {
  columns: ColumnConfig[];
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: IconName;
  image?: string;
  rows: RowConfig[];
}

export interface FormSchema {
  title: string;
  description?: string;
  layout?: "standard" | "tabs";
  tabs?: TabConfig[];
  rows?: RowConfig[];
}

// ── Zod Schemas ─────────────────────────────────────────

export const ControlTypeSchema = z.enum(CONTROL_TYPES);

const SuffixActionSchema = z.enum([
  "toggleVisibility",
  "clear",
  "search",
  "calendar",
]);

const IconNameSchema = z.enum(ICON_NAMES);

export const ValidationConfigSchema = z.object({
  required: z.boolean().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  min: z.union([z.number(), z.string()]).optional(),
  max: z.union([z.number(), z.string()]).optional(),
  email: z.boolean().optional(),
});

export const ApiConfigSchema = z.object({
  endpoint: z.string(),
  method: z.enum(["GET", "POST"]).optional(),
  labelKey: z.string(),
  valueKey: z.string(),
  dependency: z.string().optional(),
  paramKey: z.string().optional(),
});

export const OptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  icon: IconNameSchema.optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  command: z.string().optional(),
});

export const TransliterationConfigSchema = z.object({
  enabled: z.boolean(),
  languages: z
    .union([
      z.array(z.object({ code: z.string(), label: z.string() })),
      z.array(z.string()),
    ])
    .optional(),
  defaultLanguage: z.string().optional(),
  showControls: z.boolean().optional(),
  autoConvert: z.boolean().optional(),
});

export const FormFieldConfigSchema = z.object({
  key: z.string(),
  type: ControlTypeSchema,
  label: z.string(),
  placeholder: z.string().optional(),
  defaultValue: z.unknown().optional(),
  options: z.array(OptionSchema).optional(),
  api: ApiConfigSchema.optional(),
  validators: ValidationConfigSchema.optional(),
  hidden: z.boolean().optional(),
  props: z.record(z.string(), z.unknown()).optional(),

  prefixIcon: IconNameSchema.optional(),
  suffixIcon: IconNameSchema.optional(),
  suffixAction: SuffixActionSchema.optional(),

  transliteration: TransliterationConfigSchema.optional(),

  size: ControlSizeSchema.optional(),
  tooltip: z.string().optional(),

  previousControl: z.string().optional(),
  nextControl: z.string().optional(),

  ui: UiConfigSchema.partial().optional(),
});

export const ColumnConfigSchema = z.object({
  span: z.string(),
  field: FormFieldConfigSchema,
});

export const RowConfigSchema = z.object({
  columns: z.array(ColumnConfigSchema),
});

export const TabConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: IconNameSchema.optional(),
  image: z.string().optional(),
  rows: z.array(RowConfigSchema),
});

export const FormSchemaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  layout: z.enum(["standard", "tabs"]).optional(),
  tabs: z.array(TabConfigSchema).optional(),
  rows: z.array(RowConfigSchema).optional(),
});
