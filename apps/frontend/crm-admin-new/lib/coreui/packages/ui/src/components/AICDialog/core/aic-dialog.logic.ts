/**
 * AICDialog pure logic functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular aic-dialog.component.ts
 */

import type {
  DialogPosition,
  DialogVariant,
  DialogIconStyle,
} from "./aic-dialog.types";

// ---------------------------------------------------------------------------
// Overlay position styles
// ---------------------------------------------------------------------------

/**
 * Returns flexbox justifyContent and alignItems values for the overlay
 * based on the requested dialog position.
 */
export function getOverlayPositionStyles(
  position: DialogPosition,
): { justifyContent: string; alignItems: string } {
  const map: Record<DialogPosition, { justifyContent: string; alignItems: string }> = {
    center: { justifyContent: "center", alignItems: "center" },
    top: { justifyContent: "center", alignItems: "flex-start" },
    bottom: { justifyContent: "center", alignItems: "flex-end" },
    left: { justifyContent: "flex-start", alignItems: "center" },
    right: { justifyContent: "flex-end", alignItems: "center" },
    "top-left": { justifyContent: "flex-start", alignItems: "flex-start" },
    "top-right": { justifyContent: "flex-end", alignItems: "flex-start" },
    "bottom-left": { justifyContent: "flex-start", alignItems: "flex-end" },
    "bottom-right": { justifyContent: "flex-end", alignItems: "flex-end" },
  };
  return map[position] || map.center;
}

// ---------------------------------------------------------------------------
// Icon badge classes
// ---------------------------------------------------------------------------

/**
 * Builds the CSS class string for the icon badge wrapper based on
 * icon style, variant, and whether the large layout is used.
 */
export function getIconBadgeClasses(
  iconStyle: DialogIconStyle,
  variant: DialogVariant,
  isLarge: boolean,
): string {
  const classes = [
    "inline-flex items-center justify-center rounded-full flex-shrink-0",
  ];

  if (isLarge) classes.push("w-[4.5rem] h-[4.5rem]");
  else classes.push("w-8 h-8");

  if (iconStyle === "plain") return "inline-flex items-center justify-center";

  const bgMap: Record<string, Record<string, string>> = {
    "soft-circle": {
      info: "bg-blue-100",
      success: "bg-green-100",
      warning: "bg-amber-100",
      error: "bg-red-100",
    },
    "filled-circle": {
      info: "bg-blue-600",
      success: "bg-green-600",
      warning: "bg-amber-600",
      error: "bg-red-600",
    },
  };

  classes.push(bgMap[iconStyle]?.[variant] || "");
  return classes.join(" ");
}

// ---------------------------------------------------------------------------
// Icon color class
// ---------------------------------------------------------------------------

/**
 * Returns the text color class for the icon based on icon style and variant.
 */
export function getIconColorClass(
  iconStyle: DialogIconStyle,
  variant: DialogVariant,
): string {
  if (iconStyle === "filled-circle") return "text-white";

  const map: Record<string, string> = {
    info: "text-blue-700",
    success: "text-green-700",
    warning: "text-amber-700",
    error: "text-red-700",
  };
  return map[variant] || "text-slate-500";
}
