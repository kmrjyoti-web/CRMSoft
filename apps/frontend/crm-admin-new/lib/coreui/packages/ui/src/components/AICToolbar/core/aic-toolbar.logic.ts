/**
 * AICToolbar state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular aic-toolbar component — exact port.
 */

import type { AICToolbarAction } from "./aic-toolbar.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Finds an action by its ID from the actions array.
 * Returns undefined if not found.
 */
export function findActionById(
  actions: AICToolbarAction[],
  id: string,
): AICToolbarAction | undefined {
  return actions.find((action) => action.id === id);
}

/**
 * Returns the default variant for the primary action button.
 */
export function getPrimaryActionVariant(
  action?: AICToolbarAction,
): string {
  return action?.variant || "primary";
}
