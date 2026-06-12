/**
 * Drawer accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects and keyboard-to-action mappings that
 * framework adapters can spread onto DOM elements and wire into event handlers.
 */

import type { DrawerAction } from "./drawer.logic";

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getDrawerA11yProps`. */
export interface DrawerA11yInput {
  /** Unique identifier for the drawer. */
  id?: string;
  /** Title text displayed in the drawer header. */
  title?: string;
}

/** Shape of the object returned by `getDrawerA11yProps`. */
export interface DrawerA11yProps {
  role: string;
  "aria-modal": boolean;
  "aria-labelledby"?: string;
}

/**
 * Computes the ARIA attributes for a Drawer element.
 *
 * - Always sets `role="dialog"` and `aria-modal=true`.
 * - When a title is present, sets `aria-labelledby` pointing to the title
 *   element's ID (derived from the drawer's base ID).
 */
export function getDrawerA11yProps(input: DrawerA11yInput): DrawerA11yProps {
  const { id, title } = input;

  const props: DrawerA11yProps = {
    role: "dialog",
    "aria-modal": true,
  };

  if (title && id) {
    props["aria-labelledby"] = `${id}-title`;
  }

  return props;
}

// ---------------------------------------------------------------------------
// Keyboard handlers
// ---------------------------------------------------------------------------

/**
 * Returns a mapping from keyboard key values to the `DrawerAction` type
 * that should be dispatched when that key is pressed.
 */
export function getDrawerKeyboardHandlers(): Record<string, DrawerAction["type"]> {
  return {
    Escape: "ESCAPE",
  };
}
