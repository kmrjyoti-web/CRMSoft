/**
 * Popover variant and arrow position maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 *
 * Popovers have a single visual style with optional arrow.
 * This module exports placement-to-arrow-position mappings.
 */

import type { Placement } from "../../../utils/position";

// ---------------------------------------------------------------------------
// Arrow position classes per placement
// ---------------------------------------------------------------------------

/**
 * Maps each `Placement` to the Tailwind utility classes that position
 * the popover arrow relative to the popover body.
 *
 * The arrow is a CSS border triangle that points toward the trigger element.
 */
export const popoverArrowPositionStyles: Record<Placement, string> = {
  // Top placements — arrow points down, sits at bottom of popover
  top: "left-1/2 -translate-x-1/2 top-full",
  "top-start": "left-4 top-full",
  "top-end": "right-4 top-full",

  // Bottom placements — arrow points up, sits at top of popover
  bottom: "left-1/2 -translate-x-1/2 bottom-full",
  "bottom-start": "left-4 bottom-full",
  "bottom-end": "right-4 bottom-full",

  // Left placements — arrow points right, sits at right of popover
  left: "top-1/2 -translate-y-1/2 left-full",
  "left-start": "top-4 left-full",
  "left-end": "bottom-4 left-full",

  // Right placements — arrow points left, sits at left of popover
  right: "top-1/2 -translate-y-1/2 right-full",
  "right-start": "top-4 right-full",
  "right-end": "bottom-4 right-full",
};

// ---------------------------------------------------------------------------
// Arrow rotation per placement direction
// ---------------------------------------------------------------------------

/**
 * Maps the base placement direction to the CSS border trick that forms
 * the arrow triangle pointing toward the trigger.
 */
export const popoverArrowDirectionStyles: Record<string, string> = {
  top: "border-l-transparent border-r-transparent border-b-transparent border-t-[var(--color-bg-primary)]",
  bottom: "border-l-transparent border-r-transparent border-t-transparent border-b-[var(--color-bg-primary)]",
  left: "border-t-transparent border-b-transparent border-r-transparent border-l-[var(--color-bg-primary)]",
  right: "border-t-transparent border-b-transparent border-l-transparent border-r-[var(--color-bg-primary)]",
};
