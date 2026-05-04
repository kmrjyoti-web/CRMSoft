/**
 * Avatar component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// Size, Shape & Status unions
// ---------------------------------------------------------------------------

/** Available size presets for the Avatar component. */
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Shape variants for the Avatar component. */
export type AvatarShape = "circle" | "square";

/** Online presence status indicators. */
export type AvatarStatus = "online" | "offline" | "busy" | "away";

/** Visual state of the avatar image. */
export type AvatarImageState = "loading" | "loaded" | "error";

// ---------------------------------------------------------------------------
// AvatarProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Avatar component.
 */
export interface AvatarProps {
  /** Image source URL. */
  src?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Fallback text (e.g. user initials) shown when image is not available. */
  fallback?: string;
  /** Size preset. */
  size?: AvatarSize;
  /** Shape of the avatar. */
  shape?: AvatarShape;
  /** Online presence status indicator dot. */
  status?: AvatarStatus;
  /** Additional CSS class name(s). */
  className?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
}

// ---------------------------------------------------------------------------
// AvatarGroupProps
// ---------------------------------------------------------------------------

/** Spacing options for avatar group stacking. */
export type AvatarGroupSpacing = "tight" | "normal" | "loose";

/**
 * Core props for the AvatarGroup component.
 */
export interface AvatarGroupProps {
  /** Maximum number of avatars to show before the overflow indicator. */
  max?: number;
  /** Size preset applied to all child avatars. */
  size?: AvatarSize;
  /** Spacing between stacked avatars. */
  spacing?: AvatarGroupSpacing;
  /** Additional CSS class name(s). */
  className?: string;
}
