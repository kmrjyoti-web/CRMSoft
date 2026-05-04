/**
 * Badge accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects and keyboard-to-action mappings that
 * framework adapters can spread onto DOM elements and wire into event handlers.
 */

import type { BadgeAction } from "./badge.logic";

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getBadgeA11yProps`. */
export interface BadgeA11yInput {
  /** Whether the badge is removable. */
  removable?: boolean;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Unique identifier. */
  id?: string;
}

/** Shape of the object returned by `getBadgeA11yProps`. */
export interface BadgeA11yProps {
  role: string;
  "aria-label"?: string;
  tabIndex: number;
}

/**
 * Computes the ARIA attributes for a Badge element.
 *
 * Badges use `role="status"` to convey informational status to screen readers.
 */
export function getBadgeA11yProps(input: BadgeA11yInput): BadgeA11yProps {
  const { ariaLabel } = input;

  const props: BadgeA11yProps = {
    role: "status",
    tabIndex: -1,
  };

  if (ariaLabel) {
    props["aria-label"] = ariaLabel;
  }

  return props;
}

// ---------------------------------------------------------------------------
// Remove button ARIA props
// ---------------------------------------------------------------------------

/** Shape of the object returned by `getBadgeRemoveA11yProps`. */
export interface BadgeRemoveA11yProps {
  role: string;
  "aria-label": string;
  tabIndex: number;
}

/**
 * Computes the ARIA attributes for the Badge remove button.
 */
export function getBadgeRemoveA11yProps(badgeLabel?: string): BadgeRemoveA11yProps {
  return {
    role: "button",
    "aria-label": badgeLabel ? `Remove ${badgeLabel}` : "Remove",
    tabIndex: 0,
  };
}

// ---------------------------------------------------------------------------
// Keyboard handlers
// ---------------------------------------------------------------------------

/**
 * Returns a mapping from keyboard key values to the `BadgeAction` type
 * that should be dispatched when that key is pressed on the remove button.
 */
export function getBadgeKeyboardHandlers(): Record<string, BadgeAction["type"]> {
  return {
    Enter: "REMOVE",
    " ": "REMOVE",
    Backspace: "REMOVE",
    Delete: "REMOVE",
  };
}
