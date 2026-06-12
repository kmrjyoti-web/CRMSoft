/**
 * Select props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Select props that carry default values.
 */

import { z } from "zod";
import type { SelectProps } from "./select.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `SelectProps`.
 * Callback props (`onChange`) and renderable props are not included because
 * they are inherently runtime-only.
 */
export const selectPropsSchema = z.object({
  size: z
    .enum(["sm", "md", "lg"])
    .default("md"),
  disabled: z.boolean().default(false),
  searchable: z.boolean().default(false),
  clearable: z.boolean().default(false),
  multiple: z.boolean().default(false),
  loading: z.boolean().default(false),
  error: z.boolean().default(false),
  maxHeight: z.string().default("256px"),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type SelectPropsSchemaInput = z.input<typeof selectPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type SelectPropsSchemaOutput = z.output<typeof selectPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of select props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ size: "lg" }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveSelectDefaults(
  props?: Partial<SelectProps>,
): SelectPropsSchemaOutput {
  return selectPropsSchema.parse(props ?? {});
}
