/**
 * DialogButton state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular dialog-button.component.ts — exact port.
 */

import type { DialogType } from "../../../core/models";

// ---------------------------------------------------------------------------
// Color classes — maps variant + dialogType to button styling
// ---------------------------------------------------------------------------

const DIALOG_BUTTON_COLORS: Record<string, string> = {
  primary:
    "bg-primary border-primary text-white hover:bg-blue-600 focus:ring-blue-200",
  secondary:
    "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200",
  danger:
    "bg-red-600 border-red-600 text-white hover:bg-red-700 focus:ring-red-200",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200 shadow-none",
  outline:
    "bg-transparent border border-primary text-primary hover:bg-blue-50 focus:ring-blue-200",
  link:
    "bg-transparent text-primary hover:underline shadow-none p-0 h-auto",
};

const DIALOG_TYPE_COLORS: Record<DialogType, string> = {
  info: "bg-blue-600 border-blue-600 text-white hover:bg-blue-500 focus:ring-blue-200",
  danger: "bg-red-600 border-red-600 text-white hover:bg-red-500 focus:ring-red-200",
  warning: "bg-amber-600 border-amber-600 text-white hover:bg-amber-500 focus:ring-amber-200",
  success: "bg-green-600 border-green-600 text-white hover:bg-green-500 focus:ring-green-200",
};

/**
 * Returns color classes for the dialog button based on variant and optional
 * dialog type override.
 *
 * @param variant    - The button variant string.
 * @param dialogType - Optional dialog type that overrides variant styling.
 * @returns Tailwind class string.
 */
export function getDialogButtonColorClasses(
  variant: string,
  dialogType?: DialogType,
): string {
  if (dialogType) {
    return DIALOG_TYPE_COLORS[dialogType] ?? DIALOG_TYPE_COLORS.info;
  }
  return DIALOG_BUTTON_COLORS[variant] ?? DIALOG_BUTTON_COLORS.primary;
}
