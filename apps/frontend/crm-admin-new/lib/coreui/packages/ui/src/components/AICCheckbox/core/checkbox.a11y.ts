/**
 * Checkbox accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects and keyboard-to-action mappings that
 * framework adapters can spread onto DOM elements and wire into event handlers.
 */

import type { CheckboxAction } from "./checkbox.logic";

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getCheckboxA11yProps`. */
export interface CheckboxA11yInput {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

/** Shape of the object returned by `getCheckboxA11yProps`. */
export interface CheckboxA11yProps {
  role: "checkbox";
  "aria-checked": boolean | "mixed";
  "aria-disabled"?: boolean;
  "aria-label"?: string;
  tabIndex: number;
}

/**
 * Computes the ARIA attributes for a Checkbox element.
 *
 * - `aria-checked` is `"mixed"` when indeterminate, `true` when checked,
 *   `false` otherwise.
 * - `tabIndex` is set to `-1` when disabled so it is removed from the
 *   tab order.
 */
export function getCheckboxA11yProps(
  input: CheckboxA11yInput,
): CheckboxA11yProps {
  const {
    checked = false,
    indeterminate = false,
    disabled = false,
    ariaLabel,
  } = input;

  const props: CheckboxA11yProps = {
    role: "checkbox",
    "aria-checked": indeterminate ? "mixed" : checked,
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
 * Returns a mapping from keyboard key values to the `CheckboxAction` type
 * that should be dispatched when that key is pressed.
 *
 * Space toggles the checkbox, mirroring native `<input type="checkbox">`
 * behaviour.
 */
export function getCheckboxKeyboardHandlers(): Record<
  string,
  CheckboxAction["type"]
> {
  return {
    " ": "TOGGLE",
  };
}
