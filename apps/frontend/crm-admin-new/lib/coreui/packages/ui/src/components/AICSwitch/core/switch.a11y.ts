/**
 * Switch accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects and keyboard-to-action mappings that
 * framework adapters can spread onto DOM elements and wire into event handlers.
 */

import type { SwitchAction } from "./switch.logic";

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getSwitchA11yProps`. */
export interface SwitchA11yInput {
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

/** Shape of the object returned by `getSwitchA11yProps`. */
export interface SwitchA11yProps {
  role: "switch";
  "aria-checked": boolean;
  "aria-disabled"?: boolean;
  "aria-label"?: string;
  tabIndex: number;
}

/**
 * Computes the ARIA attributes for a Switch element.
 *
 * - `tabIndex` is set to `-1` when disabled so it is removed from the
 *   tab order.
 */
export function getSwitchA11yProps(input: SwitchA11yInput): SwitchA11yProps {
  const {
    checked = false,
    disabled = false,
    ariaLabel,
  } = input;

  const props: SwitchA11yProps = {
    role: "switch",
    "aria-checked": checked,
    tabIndex: disabled ? -1 : 0,
  };

  if (disabled) {
    props["aria-disabled"] = true;
  }

  if (ariaLabel) {
    props["aria-label"] = ariaLabel;
  }

  return props;
}

// ---------------------------------------------------------------------------
// Keyboard handlers
// ---------------------------------------------------------------------------

/**
 * Returns a mapping from keyboard key values to the `SwitchAction` type
 * that should be dispatched when that key is pressed.
 *
 * Both Space and Enter toggle the switch, which is the expected interaction
 * pattern for switch/toggle controls.
 */
export function getSwitchKeyboardHandlers(): Record<
  string,
  SwitchAction["type"]
> {
  return {
    " ": "TOGGLE",
    Enter: "TOGGLE",
  };
}
