/**
 * Tooltip variant and arrow position maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 *
 * Tooltips have a single visual style, so there is no variant map.
 * This module exports placement-to-arrow-position mappings.
 */

import type { Placement } from "../../../utils/position";

// ---------------------------------------------------------------------------
// Arrow position classes per placement
// ---------------------------------------------------------------------------

/**
 * Maps each `Placement` to the Tailwind utility classes that position
 * the tooltip arrow relative to the tooltip body.
 *
 * The arrow is a CSS border triangle that points toward the trigger element.
 */
export const arrowPositionStyles: Record<Placement, string> = {
  // Top placements — arrow points down, sits at bottom of tooltip
  top: "left-1/2 -translate-x-1/2 top-full",
  "top-start": "left-3 top-full",
  "top-end": "right-3 top-full",

  // Bottom placements — arrow points up, sits at top of tooltip
  bottom: "left-1/2 -translate-x-1/2 bottom-full",
  "bottom-start": "left-3 bottom-full",
  "bottom-end": "right-3 bottom-full",

  // Left placements — arrow points right, sits at right of tooltip
  left: "top-1/2 -translate-y-1/2 left-full",
  "left-start": "top-3 left-full",
  "left-end": "bottom-3 left-full",

  // Right placements — arrow points left, sits at left of tooltip
  right: "top-1/2 -translate-y-1/2 right-full",
  "right-start": "top-3 right-full",
  "right-end": "bottom-3 right-full",
};

// ---------------------------------------------------------------------------
// Arrow rotation per placement direction
// ---------------------------------------------------------------------------

/**
 * Maps the base placement direction to the CSS border trick that forms
 * the arrow triangle pointing toward the trigger.
 */
export const arrowDirectionStyles: Record<string, string> = {
  top: "border-l-transparent border-r-transparent border-b-transparent border-t-[var(--color-bg-tooltip)]",
  bottom: "border-l-transparent border-r-transparent border-t-transparent border-b-[var(--color-bg-tooltip)]",
  left: "border-t-transparent border-b-transparent border-r-transparent border-l-[var(--color-bg-tooltip)]",
  right: "border-t-transparent border-b-transparent border-l-transparent border-r-[var(--color-bg-tooltip)]",
};
