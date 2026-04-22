/**
 * Tooltip props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Tooltip props that carry default values.
 */

import { z } from "zod";
import type { TooltipProps } from "./tooltip.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `TooltipProps`.
 * Callback props (`onOpenChange`) are not included because they are
 * inherently runtime-only.
 */
export const tooltipPropsSchema = z.object({
  content: z.string().default(""),
  placement: z
    .enum([
      "top",
      "top-start",
      "top-end",
      "bottom",
      "bottom-start",
      "bottom-end",
      "left",
      "left-start",
      "left-end",
      "right",
      "right-start",
      "right-end",
    ])
    .default("top"),
  trigger: z.enum(["hover", "focus", "both"]).default("both"),
  delay: z.number().min(0).default(200),
  maxWidth: z.number().min(0).default(250),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type TooltipPropsSchemaInput = z.input<typeof tooltipPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type TooltipPropsSchemaOutput = z.output<typeof tooltipPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of tooltip props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ placement: "bottom" }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveTooltipDefaults(
  props?: Partial<TooltipProps>,
): TooltipPropsSchemaOutput {
  return tooltipPropsSchema.parse(props ?? {});
}
