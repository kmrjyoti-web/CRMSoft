/**
 * Popover props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Popover props that carry default values.
 */

import { z } from "zod";
import type { PopoverProps } from "./popover.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `PopoverProps`.
 * Callback props (`onOpenChange`) are not included because they are
 * inherently runtime-only.
 */
export const popoverPropsSchema = z.object({
  trigger: z.enum(["click", "hover", "focus", "manual"]).default("click"),
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
    .default("bottom"),
  arrow: z.boolean().default(true),
  offset: z.number().min(0).default(8),
  closeOnOutsideClick: z.boolean().default(true),
  closeOnEscape: z.boolean().default(true),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type PopoverPropsSchemaInput = z.input<typeof popoverPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type PopoverPropsSchemaOutput = z.output<typeof popoverPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of popover props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ placement: "top" }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolvePopoverDefaults(
  props?: Partial<PopoverProps>,
): PopoverPropsSchemaOutput {
  return popoverPropsSchema.parse(props ?? {});
}
