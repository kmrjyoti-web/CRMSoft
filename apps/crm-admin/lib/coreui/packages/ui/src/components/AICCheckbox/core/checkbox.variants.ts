/**
 * Checkbox visual state style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { CheckboxState } from "./checkbox.types";

// ---------------------------------------------------------------------------
// State → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `CheckboxState` to the corresponding Tailwind utility classes.
 * All colors reference CSS custom properties so themes can be swapped at runtime.
 */
export const checkboxStateStyles: Record<CheckboxState, string> = {
  unchecked:
    "border-2 border-[var(--color-border)] bg-[var(--color-bg)]",
  checked:
    "border-2 border-[var(--color-primary)] bg-[var(--color-primary)]",
  indeterminate:
    "border-2 border-[var(--color-primary)] bg-[var(--color-primary)]",
};
