/**
 * Input size and state style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { InputSize, InputState } from "./input.types";

// ---------------------------------------------------------------------------
// Size → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `InputSize` to height, horizontal padding, and font-size classes.
 */
export const sizeStyles: Record<InputSize, string> = {
  sm: "h-8 px-2.5 text-sm",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

// ---------------------------------------------------------------------------
// State → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `InputState` to the corresponding border and ring classes.
 * All colors reference CSS custom properties so themes can be swapped at runtime.
 */
export const stateStyles: Record<InputState, string> = {
  default:
    "border-[var(--color-border)] focus-within:border-[var(--color-border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-border-focus)]/20",
  focused:
    "border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20",
  error:
    "border-[var(--color-danger)] focus-within:ring-2 focus-within:ring-[var(--color-danger)]/20",
  disabled:
    "border-[var(--color-border)] opacity-50 cursor-not-allowed",
  readOnly:
    "border-[var(--color-border)] bg-[var(--color-bg-secondary)]",
};
