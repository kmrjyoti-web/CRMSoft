/**
 * Switch props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Switch props that carry default values.
 */

import { z } from "zod";
import type { SwitchProps } from "./switch.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `SwitchProps`.
 * Callback props (`onChange`) are not included because they are inherently
 * runtime-only.
 */
export const switchPropsSchema = z.object({
  checked: z.boolean().default(false),
  disabled: z.boolean().default(false),
  size: z.enum(["sm", "md", "lg"]).default("md"),
  labelPosition: z.enum(["left", "right"]).default("right"),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type SwitchPropsSchemaInput = z.input<typeof switchPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type SwitchPropsSchemaOutput = z.output<typeof switchPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of switch props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ size: "lg" }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveSwitchDefaults(
  props?: Partial<SwitchProps>,
): SwitchPropsSchemaOutput {
  return switchPropsSchema.parse(props ?? {});
}
