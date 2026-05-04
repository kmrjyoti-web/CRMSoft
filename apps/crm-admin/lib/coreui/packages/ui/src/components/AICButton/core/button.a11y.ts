/**
 * Button accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects and keyboard-to-action mappings that
 * framework adapters can spread onto DOM elements and wire into event handlers.
 */

import type { ButtonAction } from "./button.logic";

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getButtonA11yProps`. */
export interface ButtonA11yInput {
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  as?: string;
}

/** Shape of the object returned by `getButtonA11yProps`. */
export interface ButtonA11yProps {
  role?: string;
  "aria-disabled"?: boolean;
  "aria-busy"?: boolean;
  "aria-label"?: string;
  tabIndex: number;
}

/**
 * Computes the ARIA attributes for a Button element.
 *
 * - `role` is only added when the rendered element is not a native `<button>`.
 * - `tabIndex` is set to `-1` when the button is disabled so it is removed
 *   from the tab order.
 */
export function getButtonA11yProps(input: ButtonA11yInput): ButtonA11yProps {
  const { disabled = false, loading = false, ariaLabel, as } = input;

  const isDisabledOrLoading = disabled || loading;

  const props: ButtonA11yProps = {
    tabIndex: isDisabledOrLoading ? -1 : 0,
  };

  // Only add role when the rendered tag is not a native <button>.
  if (as !== undefined && as !== "button") {
    props.role = "button";
  }

  if (isDisabledOrLoading) {
    props["aria-disabled"] = true;
  }

  if (loading) {
    props["aria-busy"] = true;
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
 * Returns a mapping from keyboard key values to the `ButtonAction` type
 * that should be dispatched when that key is pressed.
 *
 * Both "Enter" and " " (Space) trigger a press action, mirroring native
 * `<button>` behaviour for custom elements.
 */
export function getButtonKeyboardHandlers(): Record<string, ButtonAction["type"]> {
  return {
    Enter: "PRESS",
    " ": "PRESS",
  };
}
