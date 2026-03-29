/**
 * AICToast pure logic functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular aic-toast.component.ts
 */

import type { AICToastSeverity } from "./aic-toast.types";

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Generates a unique toast ID using a random alphanumeric string.
 */
export function generateAICToastId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// ---------------------------------------------------------------------------
// Severity styles
// ---------------------------------------------------------------------------

/**
 * Returns the border, background, and icon color classes for a given severity.
 */
export function getToastSeverityStyles(
  severity: AICToastSeverity,
): { border: string; bg: string; iconColor: string } {
  const map: Record<AICToastSeverity, { border: string; bg: string; iconColor: string }> = {
    success: {
      border: "border-l-green-500",
      bg: "bg-green-50",
      iconColor: "text-green-500",
    },
    info: {
      border: "border-l-blue-500",
      bg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    warning: {
      border: "border-l-amber-500",
      bg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    error: {
      border: "border-l-red-500",
      bg: "bg-red-50",
      iconColor: "text-red-500",
    },
  };
  return map[severity] || map.info;
}

// ---------------------------------------------------------------------------
// Icon name mapping
// ---------------------------------------------------------------------------

/**
 * Returns a descriptive icon name for the given severity level.
 */
export function getAICToastIconName(severity: AICToastSeverity): string {
  const map: Record<AICToastSeverity, string> = {
    success: "checkCircle",
    info: "shieldCheck",
    warning: "shieldCheck",
    error: "close",
  };
  return map[severity] || "shieldCheck";
}
