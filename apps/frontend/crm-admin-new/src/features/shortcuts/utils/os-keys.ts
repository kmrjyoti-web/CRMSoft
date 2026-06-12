"use client";

export type OS = "mac" | "windows" | "linux";

export function detectOS(): OS {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform ?? "").toLowerCase();
  if (platform.startsWith("mac") || ua.includes("mac os")) return "mac";
  if (platform.startsWith("win") || ua.includes("windows")) return "windows";
  return "linux";
}

const SYMBOLS: Record<OS, Record<string, string>> = {
  mac: {
    ctrl: "⌃", meta: "⌘", alt: "⌥", shift: "⇧",
    enter: "↩", backspace: "⌫", delete: "⌦", escape: "⎋",
    tab: "⇥", up: "↑", down: "↓", left: "←", right: "→",
    "+": "+", "/": "/", ".": ".", ",": ",",
  },
  windows: {
    ctrl: "Ctrl", meta: "Win", alt: "Alt", shift: "Shift",
    enter: "Enter", backspace: "Backspace", delete: "Del", escape: "Esc",
    tab: "Tab", up: "↑", down: "↓", left: "←", right: "→",
    f1: "F1", f2: "F2", f3: "F3", f4: "F4", f5: "F5",
    f6: "F6", f7: "F7", f8: "F8", f9: "F9", f10: "F10",
    f11: "F11", f12: "F12",
    insert: "Ins", "+": "+", "/": "/",
  },
  linux: {
    ctrl: "Ctrl", meta: "Super", alt: "Alt", shift: "Shift",
    enter: "Enter", backspace: "Backspace", delete: "Del", escape: "Esc",
    tab: "Tab", up: "↑", down: "↓", left: "←", right: "→",
    "+": "+", "/": "/",
  },
};

/** Format a single key part for display. */
export function formatKeyPart(part: string, os?: OS): string {
  const currentOS = os ?? detectOS();
  const map = SYMBOLS[currentOS];
  return map[part.toLowerCase()] ?? part.toUpperCase();
}

/**
 * Format a full key combo string for display.
 * On Mac: "meta+shift+c" → "⌘⇧C"
 * On Windows: "alt+c" → "Alt + C"
 */
export function formatKey(key: string, os?: OS): string {
  const currentOS = os ?? detectOS();
  const parts = key.toLowerCase().split("+");
  const formatted = parts.map((p) => formatKeyPart(p, currentOS));
  return currentOS === "mac" ? formatted.join("") : formatted.join(" + ");
}

/**
 * Extract the physical key letter from e.code.
 * e.code = "KeyC" → "c", "Digit1" → "1", "F5" → "f5", "Slash" → "/"
 * This avoids Alt+letter producing special chars on Mac (e.g. Alt+C = "ç").
 */
function codeToKey(code: string): string | null {
  if (code.startsWith("Key")) return code.slice(3).toLowerCase();
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("F") && /^F\d+$/.test(code)) return code.toLowerCase();
  const codeMap: Record<string, string> = {
    Slash: "/", Backslash: "\\", BracketLeft: "[", BracketRight: "]",
    Semicolon: ";", Quote: "'", Comma: ",", Period: ".", Minus: "-",
    Equal: "=", Backquote: "`", Space: "space",
    Insert: "insert", Delete: "delete", Home: "home", End: "end",
    PageUp: "pageup", PageDown: "pagedown",
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    Enter: "enter", Backspace: "backspace", Escape: "escape", Tab: "tab",
    NumpadAdd: "num+", NumpadSubtract: "num-", NumpadMultiply: "num*",
    NumpadDivide: "num/", NumpadDecimal: "num.",
  };
  return codeMap[code] ?? null;
}

/**
 * Normalize a KeyboardEvent to internal key string.
 * Format: "ctrl+alt+shift+key" (lowercase, sorted modifiers: ctrl→alt→shift→key)
 *
 * Cross-platform rules:
 * - Mac Cmd (metaKey) → "meta" (stored as "meta" in DB for Mac shortcuts)
 * - Uses e.code (physical key) NOT e.key to avoid Alt producing special chars on Mac
 * - "ctrl+/" always fires regardless of OS for the shortcut panel
 */
export function eventToKeyString(e: KeyboardEvent): string {
  const os = detectOS();
  const parts: string[] = [];

  if (os === "mac") {
    // On Mac: Cmd = meta, Ctrl = ctrl (kept separate)
    if (e.metaKey) parts.push("meta");
    if (e.ctrlKey) parts.push("ctrl");
  } else {
    // On Windows/Linux: Ctrl only
    if (e.ctrlKey) parts.push("ctrl");
  }
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");

  const skipCodes = new Set(["ControlLeft", "ControlRight", "AltLeft", "AltRight",
    "ShiftLeft", "ShiftRight", "MetaLeft", "MetaRight", "OSLeft", "OSRight"]);
  if (skipCodes.has(e.code)) return "";

  const physicalKey = codeToKey(e.code);
  if (!physicalKey) return "";

  parts.push(physicalKey);
  return parts.join("+");
}
