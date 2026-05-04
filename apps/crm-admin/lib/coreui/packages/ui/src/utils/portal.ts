/**
 * Portal utilities.
 * Framework-agnostic — no DOM types.
 *
 * Provides z-index hierarchy management and portal configuration resolution.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Z-index hierarchy
// ---------------------------------------------------------------------------

/** Named z-index levels ordered from lowest to highest. */
export type PortalLevel =
  | "dropdown"
  | "sticky"
  | "overlay"
  | "modal"
  | "popover"
  | "toast"
  | "tooltip";

/** Z-index values for each portal level. */
const portalZIndexMap: Record<PortalLevel, number> = {
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
};

/**
 * Returns the z-index number for a given portal level.
 *
 * @param level - The named z-index level.
 * @returns The numeric z-index value.
 */
export function getPortalZIndex(level: PortalLevel): number {
  return portalZIndexMap[level];
}

// ---------------------------------------------------------------------------
// Portal configuration
// ---------------------------------------------------------------------------

/** Configuration for portal rendering. */
export interface PortalConfig {
  /** Z-index level for the portal. */
  level: PortalLevel;
  /** Optional DOM container element ID to portal into. Defaults to body. */
  containerId?: string;
  /** Whether to lock body scroll when portal is open. */
  lockScroll?: boolean;
}

/** Zod schema for validating and defaulting portal config. */
export const portalConfigSchema = z.object({
  level: z
    .enum(["dropdown", "sticky", "overlay", "modal", "popover", "toast", "tooltip"])
    .default("overlay"),
  containerId: z.string().optional(),
  lockScroll: z.boolean().default(false),
});

/** Inferred input type (all fields optional thanks to defaults). */
export type PortalConfigSchemaInput = z.input<typeof portalConfigSchema>;

/** Inferred output type (defaults resolved). */
export type PortalConfigSchemaOutput = z.output<typeof portalConfigSchema>;

/**
 * Resolves a partial portal config into a fully defaulted config.
 *
 * @param config - Partial portal configuration.
 * @returns Fully resolved portal configuration.
 */
export function resolvePortalConfig(
  config?: Partial<PortalConfig>,
): PortalConfigSchemaOutput {
  return portalConfigSchema.parse(config ?? {});
}
