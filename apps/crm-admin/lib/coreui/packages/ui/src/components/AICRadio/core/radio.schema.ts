/**
 * Radio props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Radio props that carry default values.
 */

import { z } from "zod";
import type { RadioProps } from "./radio.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `RadioProps`.
 * Callback props (`onChange`) are not included because they are inherently
 * runtime-only.
 */
export const radioPropsSchema = z.object({
  disabled: z.boolean().default(false),
  checked: z.boolean().default(false),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type RadioPropsSchemaInput = z.input<typeof radioPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type RadioPropsSchemaOutput = z.output<typeof radioPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of radio props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ disabled: true }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveRadioDefaults(
  props?: Partial<RadioProps>,
): RadioPropsSchemaOutput {
  return radioPropsSchema.parse(props ?? {});
}
