/**
 * ToolbarButton state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular toolbar-button component — exact port.
 */

import type { ToolbarButtonColor } from "./toolbar-button.types";

// ---------------------------------------------------------------------------
// Color → AICButton variant mapping
// ---------------------------------------------------------------------------

/**
 * Maps a ToolbarButton color preset to the corresponding AICButton variant.
 */
export function mapColorToVariant(color: ToolbarButtonColor): string {
  switch (color) {
    case "primary":
      return "primary";
    case "danger":
      return "danger";
    default:
      return "ghost";
  }
}

// ---------------------------------------------------------------------------
// Icon resolution
// ---------------------------------------------------------------------------

/**
 * Resolves the effective icon name from `iconName` and `icon` props.
 * `iconName` takes precedence over `icon`.
 */
export function resolveToolbarIcon(
  icon?: string,
  iconName?: string,
): string | undefined {
  return iconName || icon || undefined;
}
