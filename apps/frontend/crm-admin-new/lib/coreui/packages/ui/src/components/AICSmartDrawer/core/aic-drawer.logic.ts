/**
 * AICDrawer pure logic functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular aic-drawer.component.ts
 */

import type { AICDrawerMode, AICDrawerPosition } from "./aic-drawer.types";

// ---------------------------------------------------------------------------
// Container position classes
// ---------------------------------------------------------------------------

/**
 * Returns Tailwind position / size classes for the drawer container
 * based on mode, position, and minimize/maximize/preview state.
 */
export function getDrawerContainerClasses(opts: {
  mode: AICDrawerMode;
  position: AICDrawerPosition;
  isMaximized: boolean;
  isMinimized: boolean;
  isPreviewing: boolean;
}): string {
  if (opts.isMaximized) {
    return "top-0 left-0 w-full h-full rounded-none";
  }

  if (opts.isMinimized && !opts.isPreviewing) {
    return "bottom-0 right-20 w-72 h-14 rounded-t-xl rounded-b-none border-b-0";
  }

  if (opts.isPreviewing) {
    return "bottom-0 right-20 w-[480px] h-[600px] rounded-t-2xl border-b-0";
  }

  if (opts.mode === "drawer") {
    const posMap: Record<string, string> = {
      left: "top-0 left-0 h-full rounded-r-3xl",
      right: "top-0 right-0 h-full rounded-l-3xl",
      top: "top-0 left-0 w-full rounded-b-3xl",
      bottom: "bottom-0 left-0 w-full rounded-t-3xl",
    };
    return posMap[opts.position] || posMap.right;
  }

  // Modal positions
  const modalMap: Record<string, string> = {
    center:
      "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem]",
    top: "top-10 left-1/2 -translate-x-1/2 rounded-[2.5rem]",
    bottom: "bottom-10 left-1/2 -translate-x-1/2 rounded-[2.5rem]",
    left: "top-1/2 left-10 -translate-y-1/2 rounded-[2.5rem]",
    right: "top-1/2 right-10 -translate-y-1/2 rounded-[2.5rem]",
    "top-left": "top-10 left-10 rounded-[2.5rem]",
    "top-right": "top-10 right-10 rounded-[2.5rem]",
    "bottom-left": "bottom-10 left-10 rounded-[2.5rem]",
    "bottom-right": "bottom-10 right-10 rounded-[2.5rem]",
  };
  return modalMap[opts.position] || modalMap.center;
}

// ---------------------------------------------------------------------------
// Container inline styles
// ---------------------------------------------------------------------------

/**
 * Returns inline style object (width, height, maxWidth) for the drawer
 * container based on mode, position, and dimensions.
 */
export function getDrawerContainerStyles(opts: {
  mode: AICDrawerMode;
  position: AICDrawerPosition;
  isMaximized: boolean;
  isMinimized: boolean;
  isPreviewing: boolean;
  width?: string | number;
  height?: string | number;
}): Record<string, string> {
  // These states are sized by CSS classes only
  if (
    opts.isMaximized ||
    (opts.isMinimized && !opts.isPreviewing) ||
    opts.isPreviewing
  ) {
    return {};
  }

  const styles: Record<string, string> = {};
  const pos =
    opts.position || (opts.mode === "drawer" ? "right" : "center");

  // Width
  if (opts.width) {
    styles.width =
      typeof opts.width === "number" ? opts.width + "px" : opts.width;
  } else {
    styles.width =
      opts.mode === "drawer"
        ? ["top", "bottom"].includes(pos)
          ? "100%"
          : "600px"
        : "800px";
  }
  styles.maxWidth = opts.mode === "drawer" ? "100vw" : "95vw";

  // Height
  if (opts.height) {
    styles.height =
      typeof opts.height === "number" ? opts.height + "px" : opts.height;
  } else if (opts.mode === "drawer") {
    styles.height =
      ["left", "right"].includes(pos) || !pos ? "100%" : "400px";
  } else {
    styles.height = "80vh";
  }

  return styles;
}

// ---------------------------------------------------------------------------
// New-tab helper
// ---------------------------------------------------------------------------

/**
 * Opens the given path in a new browser tab.
 */
export function openInNewTab(path: string): void {
  const url =
    (typeof window !== "undefined" ? window.location.origin : "") + path;
  window.open(url, "_blank", "noopener,noreferrer");
}
