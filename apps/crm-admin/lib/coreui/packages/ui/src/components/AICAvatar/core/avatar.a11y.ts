/**
 * Avatar accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects that framework adapters can spread onto
 * DOM elements.
 */

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getAvatarA11yProps`. */
export interface AvatarA11yInput {
  /** Alt text for the image. */
  alt?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Whether the avatar is purely decorative (no semantic meaning). */
  decorative?: boolean;
}

/** Shape of the object returned by `getAvatarA11yProps`. */
export interface AvatarA11yProps {
  role: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

/**
 * Computes the ARIA attributes for an Avatar element.
 *
 * - Uses `role="img"` to communicate that this is a graphical element.
 * - When decorative, `aria-hidden` is set to true.
 */
export function getAvatarA11yProps(input: AvatarA11yInput): AvatarA11yProps {
  const { alt, ariaLabel, decorative = false } = input;

  if (decorative) {
    return {
      role: "img",
      "aria-hidden": true,
    };
  }

  const label = ariaLabel || alt;

  const props: AvatarA11yProps = {
    role: "img",
  };

  if (label) {
    props["aria-label"] = label;
  }

  return props;
}

// ---------------------------------------------------------------------------
// Image ARIA props
// ---------------------------------------------------------------------------

/** Shape of the object returned by `getAvatarImageA11yProps`. */
export interface AvatarImageA11yProps {
  alt: string;
}

/**
 * Computes the alt attribute for the avatar image element.
 */
export function getAvatarImageA11yProps(alt?: string): AvatarImageA11yProps {
  return {
    alt: alt || "",
  };
}

// ---------------------------------------------------------------------------
// Group ARIA props
// ---------------------------------------------------------------------------

/** Shape of the object returned by `getAvatarGroupA11yProps`. */
export interface AvatarGroupA11yProps {
  role: string;
  "aria-label": string;
}

/**
 * Computes the ARIA attributes for an AvatarGroup element.
 */
export function getAvatarGroupA11yProps(
  totalCount?: number,
): AvatarGroupA11yProps {
  const label = totalCount
    ? `Group of ${totalCount} users`
    : "Group of users";

  return {
    role: "group",
    "aria-label": label,
  };
}
