/**
 * Checkbox props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Checkbox props that carry default values.
 */

import { z } from "zod";
import type { CheckboxProps } from "./checkbox.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `CheckboxProps`.
 * Callback props (`onChange`) are not included because they are inherently
 * runtime-only.
 */
export const checkboxPropsSchema = z.object({
  checked: z.boolean().default(false),
  indeterminate: z.boolean().default(false),
  disabled: z.boolean().default(false),
  error: z.boolean().default(false),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type CheckboxPropsSchemaInput = z.input<typeof checkboxPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type CheckboxPropsSchemaOutput = z.output<typeof checkboxPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of checkbox props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ checked: true }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveCheckboxDefaults(
  props?: Partial<CheckboxProps>,
): CheckboxPropsSchemaOutput {
  return checkboxPropsSchema.parse(props ?? {});
}
