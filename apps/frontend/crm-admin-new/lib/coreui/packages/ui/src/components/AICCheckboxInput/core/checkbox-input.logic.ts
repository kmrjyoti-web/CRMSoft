/**
 * CheckboxInput state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular checkbox-input.component.ts — exact port.
 */

import type { CheckboxInputState } from "./checkbox-input.types";

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

export interface ResolveCheckboxInputStateProps {
  disabled?: boolean;
  error?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
}

export function resolveCheckboxInputState(
  props: ResolveCheckboxInputStateProps,
): CheckboxInputState {
  if (props.disabled) return "disabled";
  if (props.error) return "error";
  if (props.indeterminate) return "indeterminate";
  if (props.checked) return "checked";
  return "default";
}

// ---------------------------------------------------------------------------
// Check if rich layout should be used — port of Angular isRichLayout
// ---------------------------------------------------------------------------

export function isRichLayout(
  icon?: string,
  image?: string,
): boolean {
  return !!(icon || image);
}
