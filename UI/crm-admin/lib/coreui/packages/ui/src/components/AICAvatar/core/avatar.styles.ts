/**
 * Avatar style composition.
 * Combines base classes, size, shape, status, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import {
  sizeStyles,
  shapeStyles,
  statusStyles,
  statusSizeStyles,
  fallbackStyles,
  groupSpacingStyles,
} from "./avatar.variants";
import type {
  AvatarSize,
  AvatarShape,
  AvatarStatus,
  AvatarGroupSpacing,
} from "./avatar.types";

// ---------------------------------------------------------------------------
// Avatar container styles
// ---------------------------------------------------------------------------

export interface GetAvatarStylesProps {
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
}

const BASE_CLASSES =
  "relative inline-flex items-center justify-center overflow-hidden shrink-0";

/**
 * Returns a single, merged class string for the Avatar container.
 *
 * @param props - Subset of avatar props that influence styling.
 * @returns Merged Tailwind class string.
 */
export function getAvatarStyles(props: GetAvatarStylesProps): string {
  const { size = "md", shape = "circle", className } = props;

  return cn(
    BASE_CLASSES,
    sizeStyles[size],
    shapeStyles[shape],
    className,
  );
}

// ---------------------------------------------------------------------------
// Avatar image styles
// ---------------------------------------------------------------------------

/**
 * Returns classes for the avatar image element.
 */
export function getAvatarImageStyles(): string {
  return "h-full w-full object-cover";
}

// ---------------------------------------------------------------------------
// Avatar fallback styles
// ---------------------------------------------------------------------------

/**
 * Returns classes for the fallback initials display.
 */
export function getAvatarFallbackStyles(): string {
  return cn(
    "flex items-center justify-center h-full w-full",
    fallbackStyles,
  );
}

// ---------------------------------------------------------------------------
// Status indicator styles
// ---------------------------------------------------------------------------

export interface GetAvatarStatusStylesProps {
  status: AvatarStatus;
  size?: AvatarSize;
  shape?: AvatarShape;
}

/**
 * Returns classes for the status indicator dot.
 */
export function getAvatarStatusStyles(props: GetAvatarStatusStylesProps): string {
  const { status, size = "md", shape = "circle" } = props;

  const positionClasses =
    shape === "circle"
      ? "absolute bottom-0 right-0"
      : "absolute bottom-0 right-0";

  return cn(
    positionClasses,
    "rounded-full border-[var(--color-bg)]",
    statusStyles[status],
    statusSizeStyles[size],
  );
}

// ---------------------------------------------------------------------------
// Avatar group styles
// ---------------------------------------------------------------------------

export interface GetAvatarGroupStylesProps {
  spacing?: AvatarGroupSpacing;
  className?: string;
}

/**
 * Returns classes for the AvatarGroup container.
 */
export function getAvatarGroupStyles(props: GetAvatarGroupStylesProps): string {
  const { spacing = "normal", className } = props;

  return cn(
    "inline-flex items-center",
    groupSpacingStyles[spacing],
    className,
  );
}

// ---------------------------------------------------------------------------
// Overflow indicator styles
// ---------------------------------------------------------------------------

export interface GetAvatarOverflowStylesProps {
  size?: AvatarSize;
  shape?: AvatarShape;
}

/**
 * Returns classes for the +N overflow indicator in an AvatarGroup.
 */
export function getAvatarOverflowStyles(props: GetAvatarOverflowStylesProps): string {
  const { size = "md", shape = "circle" } = props;

  return cn(
    "inline-flex items-center justify-center",
    "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-medium",
    "ring-2 ring-[var(--color-bg)]",
    sizeStyles[size],
    shapeStyles[shape],
  );
}

// ---------------------------------------------------------------------------
// Fallback text generator
// ---------------------------------------------------------------------------

/**
 * Generates initials text for the avatar fallback.
 *
 * If `fallback` is provided, it is used as-is (up to 2 characters).
 * Otherwise, initials are derived from the `alt` text (first letter of
 * each of the first two words).
 *
 * @param fallback - Explicit fallback text.
 * @param alt      - Alt text from which to derive initials.
 * @returns A string of 1-2 uppercase characters, or empty string.
 */
export function getAvatarFallbackText(fallback?: string, alt?: string): string {
  if (fallback) {
    return fallback.slice(0, 2).toUpperCase();
  }

  if (alt) {
    const words = alt.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1 && words[0].length > 0) {
      return words[0][0].toUpperCase();
    }
  }

  return "";
}
