/**
 * Badge style composition.
 * Combines base classes, variant, size, state modifiers, and custom className
 * into a single Tailwind class string.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import { variantStyles, sizeStyles, dotSizeStyles } from "./badge.variants";
import type { BadgeVariant, BadgeSize } from "./badge.types";

// ---------------------------------------------------------------------------
// Style props accepted by the composer
// ---------------------------------------------------------------------------

export interface GetBadgeStylesProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Base classes shared by every badge instance
// ---------------------------------------------------------------------------

const BASE_CLASSES =
  "inline-flex items-center font-medium rounded-full transition-colors";

// ---------------------------------------------------------------------------
// getBadgeStyles
// ---------------------------------------------------------------------------

/**
 * Returns a single, merged class string for the Badge component.
 *
 * @param props - Subset of badge props that influence styling.
 * @returns Merged Tailwind class string.
 */
export function getBadgeStyles(props: GetBadgeStylesProps): string {
  const {
    variant = "default",
    size = "md",
    dot = false,
    removable = false,
    className,
  } = props;

  if (dot) {
    return cn(
      "inline-flex rounded-full",
      dotSizeStyles[size],
      variantStyles[variant],
      className,
    );
  }

  return cn(
    BASE_CLASSES,
    variantStyles[variant],
    sizeStyles[size],
    removable && "pr-1",
    className,
  );
}

// ---------------------------------------------------------------------------
// Remove button styles
// ---------------------------------------------------------------------------

/**
 * Returns classes for the remove (X) button inside a removable badge.
 */
export function getBadgeRemoveButtonStyles(size: BadgeSize = "md"): string {
  const sizeMap: Record<BadgeSize, string> = {
    sm: "h-3 w-3 ml-0.5",
    md: "h-3.5 w-3.5 ml-1",
    lg: "h-4 w-4 ml-1",
  };

  return cn(
    "inline-flex items-center justify-center rounded-full",
    "hover:bg-[var(--color-bg-overlay)] focus:outline-none cursor-pointer",
    "transition-colors",
    sizeMap[size],
  );
}
