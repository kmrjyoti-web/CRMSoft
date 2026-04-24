/**
 * ColorPicker state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular color-picker.component.ts — exact port + extended features.
 */

import type { RgbColor } from "./color-picker.types";

// ---------------------------------------------------------------------------
// Default palette — standard color swatches
// ---------------------------------------------------------------------------

export const DEFAULT_PALETTE: string[] = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0",
];

// ---------------------------------------------------------------------------
// Hex validation — port of Angular isValidHex
// ---------------------------------------------------------------------------

export function isValidHex(color: string): boolean {
  if (!color) return false;
  return /^#?([0-9A-F]{3}){1,2}$/i.test(color);
}

// ---------------------------------------------------------------------------
// Safe color — port of Angular safeColor computed
// Native color picker requires 6-digit hex (#RRGGBB)
// ---------------------------------------------------------------------------

export function safeColor(value: string | undefined): string {
  if (value && isValidHex(value)) {
    const hex = value.startsWith("#") ? value : `#${value}`;
    // Expand shorthand #RGB to #RRGGBB
    if (hex.length === 4) {
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    return hex;
  }
  return "#000000";
}

// ---------------------------------------------------------------------------
// Hex ↔ RGB conversions
// ---------------------------------------------------------------------------

export function hexToRgb(hex: string): RgbColor | null {
  const safe = safeColor(hex);
  const match = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i.exec(safe);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

export function clampRgb(val: number): number {
  return Math.max(0, Math.min(255, Math.round(val)));
}

export function rgbToHex(r: number, g: number, b: number): string {
  const rr = clampRgb(r).toString(16).padStart(2, "0");
  const gg = clampRgb(g).toString(16).padStart(2, "0");
  const bb = clampRgb(b).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}`;
}

// ---------------------------------------------------------------------------
// Recent colors management
// ---------------------------------------------------------------------------

export function addRecentColor(
  recent: string[],
  color: string,
  max: number = 10,
): string[] {
  const normalized = safeColor(color).toLowerCase();
  // Remove if already present, then prepend
  const filtered = recent.filter((c) => c.toLowerCase() !== normalized);
  return [normalized, ...filtered].slice(0, max);
}
