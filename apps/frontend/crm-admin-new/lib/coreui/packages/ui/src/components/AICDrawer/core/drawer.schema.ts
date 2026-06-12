/**
 * Drawer props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Drawer props that carry default values.
 */

import { z } from "zod";
import type { DrawerProps } from "./drawer.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `DrawerProps`.
 * Callback props (`onClose`) and renderable props (`children`) are not
 * included because they are inherently runtime-only.
 */
export const drawerPropsSchema = z.object({
  open: z.boolean().default(false),
  position: z
    .enum(["left", "right", "top", "bottom"])
    .default("right"),
  size: z
    .enum(["sm", "md", "lg", "xl", "full"])
    .default("md"),
  showOverlay: z.boolean().default(true),
  closeOnOverlay: z.boolean().default(true),
  closeOnEscape: z.boolean().default(true),
  showCloseButton: z.boolean().default(true),
  title: z.string().optional(),
  className: z.string().optional(),
  id: z.string().optional(),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type DrawerPropsSchemaInput = z.input<typeof drawerPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type DrawerPropsSchemaOutput = z.output<typeof drawerPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of drawer props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ position: "left" }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveDrawerDefaults(
  props?: Partial<DrawerProps>,
): DrawerPropsSchemaOutput {
  return drawerPropsSchema.parse(props ?? {});
}
