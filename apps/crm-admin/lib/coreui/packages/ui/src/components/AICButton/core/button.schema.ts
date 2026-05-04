/**
 * Button props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Button props that carry default values.
 */

import { z } from "zod";
import type { ButtonProps } from "./button.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `ButtonProps`.
 * Callback props (`onClick`) and renderable props (`children`) are not
 * included because they are inherently runtime-only.
 */
export const buttonPropsSchema = z.object({
  variant: z
    .enum(["primary", "secondary", "outline", "ghost", "danger", "link"])
    .default("primary"),
  size: z
    .enum(["xs", "sm", "md", "lg", "xl"])
    .default("md"),
  disabled: z.boolean().default(false),
  loading: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
  type: z
    .enum(["button", "submit", "reset"])
    .default("button"),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type ButtonPropsSchemaInput = z.input<typeof buttonPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type ButtonPropsSchemaOutput = z.output<typeof buttonPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of button props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ variant: "danger" }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveButtonDefaults(
  props?: Partial<ButtonProps>,
): ButtonPropsSchemaOutput {
  return buttonPropsSchema.parse(props ?? {});
}
