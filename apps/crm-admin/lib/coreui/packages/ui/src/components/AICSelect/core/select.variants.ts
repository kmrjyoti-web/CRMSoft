/**
 * Select size and state style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { SelectSize, SelectState } from "./select.types";

// ---------------------------------------------------------------------------
// Size -> Tailwind class map (applied to the trigger button)
// ---------------------------------------------------------------------------

/**
 * Maps each `SelectSize` to height, horizontal padding, and font-size classes
 * for the trigger element.
 */
export const sizeStyles: Record<SelectSize, string> = {
  sm: "h-8 px-2.5 text-sm",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

// ---------------------------------------------------------------------------
// State -> Tailwind class map (applied to the trigger button)
// ---------------------------------------------------------------------------

/**
 * Maps each `SelectState` to the corresponding border and ring classes.
 * All colors reference CSS custom properties so themes can be swapped at runtime.
 */
export const stateStyles: Record<SelectState, string> = {
  default:
    "border-[var(--color-border)] hover:border-[var(--color-border-focus)]",
  open:
    "border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20",
  focused:
    "border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20",
  error:
    "border-[var(--color-danger)] hover:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]/20",
  disabled:
    "border-[var(--color-border)] opacity-50 cursor-not-allowed",
};

// ---------------------------------------------------------------------------
// Dropdown panel base classes
// ---------------------------------------------------------------------------

/**
 * Base Tailwind classes for the floating dropdown panel.
 * Position, z-index, shape, and shadow are included here; colours use
 * CSS custom properties for theme support.
 */
export const dropdownStyles =
  "absolute z-50 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-lg overflow-hidden";
