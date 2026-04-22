/**
 * Toast config validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the global
 * toast system configuration.
 */

import { z } from "zod";
import type { ToastConfig } from "./toast.types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the `ToastConfig` with sensible defaults.
 */
export const toastConfigSchema = z.object({
  position: z
    .enum([
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ])
    .default("top-right"),
  maxVisible: z.number().int().positive().default(5),
  defaultDuration: z.number().int().nonnegative().default(5000),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type ToastConfigSchemaInput = z.input<typeof toastConfigSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type ToastConfigSchemaOutput = z.output<typeof toastConfigSchema>;

// ---------------------------------------------------------------------------
// Default resolver
// ---------------------------------------------------------------------------

/**
 * Parses a partial toast config through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param config - Partial config (e.g. only `{ position: "bottom-right" }`).
 * @returns Fully resolved config with all defaults applied.
 */
export function resolveToastDefaults(
  config?: Partial<ToastConfig>,
): ToastConfigSchemaOutput {
  return toastConfigSchema.parse(config ?? {});
}
