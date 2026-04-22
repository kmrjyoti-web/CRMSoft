/**
 * ToolbarButtonGroup state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular toolbar-button-group component — exact port.
 */

import type { ToolbarButtonGroupItem } from "./toolbar-button-group.types";
import type { ToolbarButtonSize, ToolbarButtonColor } from "../../AICToolbarButton/core/toolbar-button.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the effective size for a button item, falling back to the group default.
 */
export function resolveGroupButtonSize(
  item: ToolbarButtonGroupItem,
  groupSize?: ToolbarButtonSize,
): ToolbarButtonSize {
  return item.size || groupSize || "md";
}

/**
 * Resolves the effective color for a button item, falling back to the group default.
 */
export function resolveGroupButtonColor(
  item: ToolbarButtonGroupItem,
  groupColor?: ToolbarButtonColor,
): ToolbarButtonColor {
  return item.color || groupColor || "default";
}

/**
 * Checks whether a button item is the currently active one.
 */
export function isButtonActive(
  itemId: string,
  activeId?: string,
): boolean {
  return activeId !== undefined && activeId === itemId;
}
