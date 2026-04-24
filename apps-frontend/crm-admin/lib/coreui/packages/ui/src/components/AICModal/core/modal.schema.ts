/**
 * Modal props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Modal props that carry default values.
 */

import { z } from "zod";
import type { ModalProps } from "./modal.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `ModalProps`.
 * Callback props (`onClose`) are not included because they are
 * inherently runtime-only.
 */
export const modalPropsSchema = z.object({
  open: z.boolean().default(false),
  size: z
    .enum(["sm", "md", "lg", "xl", "full"])
    .default("md"),
  mode: z
    .enum(["center", "slide-panel", "top-dropdown"])
    .default("center"),
  closeOnOverlay: z.boolean().default(true),
  closeOnEscape: z.boolean().default(true),
  showCloseButton: z.boolean().default(true),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type ModalPropsSchemaInput = z.input<typeof modalPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type ModalPropsSchemaOutput = z.output<typeof modalPropsSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial set of modal props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props (e.g. only `{ size: "lg" }`).
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveModalDefaults(
  props?: Partial<ModalProps>,
): ModalPropsSchemaOutput {
  return modalPropsSchema.parse(props ?? {});
}
