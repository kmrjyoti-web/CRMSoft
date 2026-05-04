/**
 * Input accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects and keyboard-to-action mappings that
 * framework adapters can spread onto DOM elements and wire into event handlers.
 */

import type { InputAction } from "./input.logic";

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getInputA11yProps`. */
export interface InputA11yInput {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  ariaLabel?: string;
}

/** Shape of the object returned by `getInputA11yProps`. */
export interface InputA11yProps {
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-readonly"?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * Computes the ARIA and native attributes for an Input element.
 *
 * - `aria-invalid` is set when the input is in an error state.
 * - `aria-describedby` points to the error message element when present.
 * - `aria-readonly` is set when the input is read-only.
 * - Native `disabled` and `readOnly` attributes are passed through.
 */
export function getInputA11yProps(input: InputA11yInput): InputA11yProps {
  const {
    disabled = false,
    readOnly = false,
    error = false,
    errorMessage,
    id,
    ariaLabel,
  } = input;

  const props: InputA11yProps = {};

  if (error) {
    props["aria-invalid"] = true;
  }

  if (error && errorMessage && id) {
    props["aria-describedby"] = `${id}-error`;
  }

  if (ariaLabel) {
    props["aria-label"] = ariaLabel;
  }

  if (readOnly) {
    props["aria-readonly"] = true;
    props.readOnly = true;
  }

  if (disabled) {
    props.disabled = true;
  }

  return props;
}

// ---------------------------------------------------------------------------
// Keyboard handlers
// ---------------------------------------------------------------------------

/**
 * Returns a mapping from keyboard key values to the `InputAction` type
 * that should be dispatched when that key is pressed.
 *
 * "Escape" triggers a clear action for clearable inputs.
 */
export function getInputKeyboardHandlers(): Record<string, InputAction["type"]> {
  return {
    Escape: "CLEAR",
  };
}
