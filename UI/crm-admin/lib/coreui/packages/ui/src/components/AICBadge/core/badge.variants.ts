/**
 * Badge variant and size style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { BadgeVariant, BadgeSize } from "./badge.types";

// ---------------------------------------------------------------------------
// Variant -> Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `BadgeVariant` to the corresponding Tailwind utility classes.
 * All colors reference CSS custom properties so themes can be swapped at runtime.
 */
export const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-bg-secondary)] text-[var(--color-text)]",
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-inverse)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-text-inverse)]",
  success:
    "bg-[var(--color-success)] text-[var(--color-text-inverse)]",
  warning:
    "bg-[var(--color-warning)] text-[var(--color-text-inverse)]",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-text-inverse)]",
  outline:
    "bg-transparent border border-[var(--color-border)] text-[var(--color-text)]",
};

// ---------------------------------------------------------------------------
// Size -> Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `BadgeSize` to padding, font-size, and height classes.
 */
export const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
};

// ---------------------------------------------------------------------------
// Dot size map
// ---------------------------------------------------------------------------

/**
 * Maps each `BadgeSize` to a dot indicator size class.
 */
export const dotSizeStyles: Record<BadgeSize, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};
