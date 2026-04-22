/**
 * Input props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Input props that carry default values.
 */

import { z } from "zod";
import type { InputProps } from "./input.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `InputProps`.
 * Callback props (`onChange`) and renderable props are not included because
 * they are inherently runtime-only.
 */
export const inputPropsSchema = z.object({
  type: z
    .enum(["text", "email", "password", "number", "tel", "url", "search"])
    .default("text"),
  size: z
    .enum(["sm", "md", "lg"])
    .default("md"),
  disabled: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  error: z.boolean().default(false),
  clearable: z.boolean().default(false),
  showCharCount: z.boolean().default(false),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type InputPropsSchemaInput = z.input<typeof inputPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type InputPropsSchemaOutput = z.output<typeof inputPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of input props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ type: "email" }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveInputDefaults(
  props?: Partial<InputProps>,
): InputPropsSchemaOutput {
  return inputPropsSchema.parse(props ?? {});
}
