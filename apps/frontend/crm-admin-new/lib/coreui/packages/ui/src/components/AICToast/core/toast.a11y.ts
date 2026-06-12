/**
 * Toast accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects that framework adapters can spread onto
 * DOM elements for proper screen reader announcements.
 */

import type { ToastVariant } from "./toast.types";

// ---------------------------------------------------------------------------
// Toast ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getToastA11yProps`. */
export interface ToastA11yInput {
  /** The visual variant of the toast. */
  variant: ToastVariant;
}

/** Shape of the object returned by `getToastA11yProps`. */
export interface ToastA11yProps {
  role: string;
  "aria-live": "assertive" | "polite";
}

/**
 * Computes the ARIA attributes for an individual toast element.
 *
 * - Error toasts use `role="alert"` with `aria-live="assertive"` to
 *   immediately announce the error to screen readers.
 * - All other variants use `role="status"` with `aria-live="polite"` to
 *   announce at the next convenient opportunity.
 */
export function getToastA11yProps(input: ToastA11yInput): ToastA11yProps {
  const isError = input.variant === "error";

  return {
    role: isError ? "alert" : "status",
    "aria-live": isError ? "assertive" : "polite",
  };
}

// ---------------------------------------------------------------------------
// Toast region ARIA props
// ---------------------------------------------------------------------------

/** Shape of the object returned by `getToastRegionA11yProps`. */
export interface ToastRegionA11yProps {
  role: string;
  "aria-label": string;
}

/**
 * Computes the ARIA attributes for the toast stack container / region.
 *
 * The container is marked as a `region` landmark with a descriptive label
 * so screen reader users can navigate to the notification area.
 */
export function getToastRegionA11yProps(): ToastRegionA11yProps {
  return {
    role: "region",
    "aria-label": "Notifications",
  };
}
