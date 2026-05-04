/**
 * Avatar variant and size style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type {
  AvatarSize,
  AvatarShape,
  AvatarStatus,
  AvatarGroupSpacing,
} from "./avatar.types";

// ---------------------------------------------------------------------------
// Size -> Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `AvatarSize` to dimension and font-size classes.
 */
export const sizeStyles: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

// ---------------------------------------------------------------------------
// Shape -> Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `AvatarShape` to border-radius classes.
 */
export const shapeStyles: Record<AvatarShape, string> = {
  circle: "rounded-full",
  square: "rounded-[var(--radius-md)]",
};

// ---------------------------------------------------------------------------
// Status indicator -> Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `AvatarStatus` to its indicator color classes.
 */
export const statusStyles: Record<AvatarStatus, string> = {
  online: "bg-[var(--color-success)]",
  offline: "bg-[var(--color-text-muted)]",
  busy: "bg-[var(--color-danger)]",
  away: "bg-[var(--color-warning)]",
};

/**
 * Maps each `AvatarSize` to the status indicator dot dimensions.
 */
export const statusSizeStyles: Record<AvatarSize, string> = {
  xs: "h-1.5 w-1.5 border",
  sm: "h-2 w-2 border",
  md: "h-2.5 w-2.5 border-2",
  lg: "h-3 w-3 border-2",
  xl: "h-4 w-4 border-2",
};

// ---------------------------------------------------------------------------
// Fallback -> Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Fallback background and text styling.
 */
export const fallbackStyles =
  "bg-[var(--color-bg-secondary)] text-[var(--color-text)] font-medium";

// ---------------------------------------------------------------------------
// Group spacing -> Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `AvatarGroupSpacing` to the negative margin used for stacking.
 */
export const groupSpacingStyles: Record<AvatarGroupSpacing, string> = {
  tight: "-space-x-3",
  normal: "-space-x-2",
  loose: "-space-x-1",
};
