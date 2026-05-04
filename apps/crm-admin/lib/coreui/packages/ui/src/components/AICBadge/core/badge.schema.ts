/**
 * Badge props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Badge props that carry default values.
 */

import { z } from "zod";
import type { BadgeProps } from "./badge.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `BadgeProps`.
 * Callback props (`onRemove`) and renderable props (`children`) are not
 * included because they are inherently runtime-only.
 */
export const badgePropsSchema = z.object({
  variant: z
    .enum(["default", "primary", "secondary", "success", "warning", "danger", "outline"])
    .default("default"),
  size: z
    .enum(["sm", "md", "lg"])
    .default("md"),
  dot: z.boolean().default(false),
  removable: z.boolean().default(false),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type BadgePropsSchemaInput = z.input<typeof badgePropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type BadgePropsSchemaOutput = z.output<typeof badgePropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of badge props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ variant: "danger" }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveBadgeDefaults(
  props?: Partial<BadgeProps>,
): BadgePropsSchemaOutput {
  return badgePropsSchema.parse(props ?? {});
}
