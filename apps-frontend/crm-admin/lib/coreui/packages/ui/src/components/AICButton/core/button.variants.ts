/**
 * Button variant and size style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { ButtonVariant, ButtonSize } from "./button.types";

// ---------------------------------------------------------------------------
// Variant → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `ButtonVariant` to the corresponding Tailwind utility classes.
 * All colors reference CSS custom properties so themes can be swapped at runtime.
 */
export const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-secondary-hover)]",
  outline:
    "border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)]",
  ghost:
    "text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-text-inverse)] hover:bg-[var(--color-danger-hover)]",
  link:
    "text-[var(--color-text-link)] hover:underline p-0 h-auto",
};

// ---------------------------------------------------------------------------
// Size → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `ButtonSize` to height, horizontal padding, and font-size classes.
 */
export const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-6 px-2 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-lg",
};
