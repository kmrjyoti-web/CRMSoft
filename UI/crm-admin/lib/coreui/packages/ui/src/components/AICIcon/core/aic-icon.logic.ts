/**
 * AICIcon state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular aic-icon.component.ts — exact port.
 */

import type { AICIconSize } from "./aic-icon.types";

// ---------------------------------------------------------------------------
// Size resolution
// ---------------------------------------------------------------------------

/** Map of predefined size tokens to CSS rem values. */
const SIZE_MAP: Record<string, string> = {
  tiny: "0.75rem",
  sm: "0.875rem",
  small: "0.875rem",
  md: "1rem",
  medium: "1rem",
  lg: "1.25rem",
  large: "1.25rem",
  xlarge: "1.5rem",
  "2xl": "2rem",
};

/**
 * Resolves a AICIconSize token to a CSS size string.
 * Returns the mapped value for known tokens, or the raw string for custom sizes.
 * Defaults to '1rem' if no size is provided.
 */
export function resolveIconSize(size?: AICIconSize): string {
  if (!size) return "1rem";
  return SIZE_MAP[size] || size;
}

// ---------------------------------------------------------------------------
// SVG processing
// ---------------------------------------------------------------------------

/**
 * Processes an SVG string for color inheritance:
 * - Replaces `fill` and `stroke` attributes with `currentColor` (except `none`).
 * - Removes `width`, `height`, and `class` attributes so the icon can be
 *   sized via the parent container.
 *
 * Uses simple regex for server-safe (no DOM) processing.
 */
export function processSvgForColor(svg: string): string {
  return svg
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
    .replace(/width="[^"]*"/, "")
    .replace(/height="[^"]*"/, "")
    .replace(/class="[^"]*"/, "");
}
