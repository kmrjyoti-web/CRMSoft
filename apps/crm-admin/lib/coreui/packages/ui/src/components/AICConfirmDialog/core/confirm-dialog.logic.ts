/**
 * ConfirmDialog state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular confirm-dialog.component.ts — exact port.
 */

import type { DialogType } from "../../../core/models";

// ---------------------------------------------------------------------------
// Icon background classes — port of Angular type-based icon circle
// ---------------------------------------------------------------------------

const DIALOG_ICON_BG: Record<DialogType, string> = {
  info: "bg-blue-50",
  danger: "bg-red-50",
  warning: "bg-amber-50",
  success: "bg-green-50",
};

/**
 * Returns the background class for the icon circle based on dialog type.
 */
export function getDialogIconBgClass(type: DialogType): string {
  return DIALOG_ICON_BG[type] ?? DIALOG_ICON_BG.info;
}

// ---------------------------------------------------------------------------
// Icon text color classes
// ---------------------------------------------------------------------------

const DIALOG_ICON_TEXT: Record<DialogType, string> = {
  info: "text-blue-600",
  danger: "text-red-600",
  warning: "text-amber-600",
  success: "text-green-600",
};

/**
 * Returns the text color class for the icon based on dialog type.
 */
export function getDialogIconTextClass(type: DialogType): string {
  return DIALOG_ICON_TEXT[type] ?? DIALOG_ICON_TEXT.info;
}

// ---------------------------------------------------------------------------
// Confirm button classes
// ---------------------------------------------------------------------------

const DIALOG_CONFIRM_BTN: Record<DialogType, string> = {
  info: "bg-blue-600 hover:bg-blue-500 focus:ring-blue-200",
  danger: "bg-red-600 hover:bg-red-500 focus:ring-red-200",
  warning: "bg-amber-600 hover:bg-amber-500 focus:ring-amber-200",
  success: "bg-green-600 hover:bg-green-500 focus:ring-green-200",
};

/**
 * Returns the Tailwind classes for the confirm button based on dialog type.
 */
export function getDialogConfirmButtonClass(type: DialogType): string {
  return DIALOG_CONFIRM_BTN[type] ?? DIALOG_CONFIRM_BTN.info;
}

// ---------------------------------------------------------------------------
// Icon name mapping
// ---------------------------------------------------------------------------

const DIALOG_ICON_NAMES: Record<DialogType, string> = {
  info: "shieldCheck",
  danger: "trash",
  warning: "shieldCheck",
  success: "checkCircle",
};

/**
 * Returns the icon name for the dialog type.
 */
export function getDialogIconName(type: DialogType): string {
  return DIALOG_ICON_NAMES[type] ?? DIALOG_ICON_NAMES.info;
}
