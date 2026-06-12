/**
 * ButtonControl state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular button-control.component.ts — exact port.
 */

// ---------------------------------------------------------------------------
// Active option check
// ---------------------------------------------------------------------------

/**
 * Determines whether a given option value is the currently active/selected
 * value within a button group or split dropdown.
 *
 * @param currentValue - The current value (can be any type).
 * @param optionValue  - The option's value string to compare against.
 * @returns `true` if the option is active.
 */
export function isActiveOption(
  currentValue: unknown,
  optionValue: string,
): boolean {
  return String(currentValue) === optionValue;
}
