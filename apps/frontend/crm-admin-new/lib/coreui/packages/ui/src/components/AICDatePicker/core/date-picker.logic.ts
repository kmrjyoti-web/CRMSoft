/**
 * DatePicker state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular date-picker.component.ts — exact port of logic.
 */

import type { DatePickerShape } from "./date-picker.types";

// ---------------------------------------------------------------------------
// Shape class resolution
// ---------------------------------------------------------------------------

/** Shape-to-class mapping for border radius. */
const SHAPE_CLASSES: Record<DatePickerShape, string> = {
  rounded: "rounded-lg",
  square: "rounded-none",
  circle: "rounded-full",
};

/**
 * Returns the appropriate border-radius CSS class for the given shape.
 * Falls back to `rounded-lg` (the "rounded" shape) if no shape is provided.
 *
 * @param shape - The shape variant.
 * @param base  - Optional base class to replace (unused, kept for API compat).
 * @returns The Tailwind border-radius class.
 */
export function getShapeClass(
  shape: DatePickerShape | undefined,
  _base?: string,
): string {
  return SHAPE_CLASSES[shape ?? "rounded"];
}

// ---------------------------------------------------------------------------
// Date empty check
// ---------------------------------------------------------------------------

/**
 * Checks whether a date string value is empty or falsy.
 *
 * @param value - The date string to check.
 * @returns `true` if the value is empty, undefined, or null.
 */
export function isDateEmpty(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0;
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/**
 * Ensures a date string is in YYYY-MM-DD format suitable for native
 * `<input type="date">`.
 *
 * If the input is already in YYYY-MM-DD format it is returned as-is.
 * If it can be parsed as a valid date, it is reformatted.
 * Otherwise returns an empty string.
 *
 * @param date - The date string to format.
 * @returns A YYYY-MM-DD formatted string, or empty string if invalid.
 */
export function formatDateForInput(date: string | undefined | null): string {
  if (!date) return "";

  // Already in correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
