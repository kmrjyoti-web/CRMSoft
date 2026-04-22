/**
 * Drawer style composition.
 * Combines base classes, position, size, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import {
  drawerPositionStyles,
  drawerHorizontalSizeStyles,
  drawerVerticalSizeStyles,
} from "./drawer.variants";
import type { DrawerPosition, DrawerSize } from "./drawer.types";

// ---------------------------------------------------------------------------
// Overlay styles
// ---------------------------------------------------------------------------

/**
 * Returns the Tailwind class string for the drawer backdrop overlay.
 */
export function getDrawerOverlayStyles(): string {
  return cn(
    "fixed inset-0",
    "bg-[var(--color-bg-overlay)]",
  );
}

// ---------------------------------------------------------------------------
// Content styles
// ---------------------------------------------------------------------------

/** Props accepted by getDrawerContentStyles. */
export interface GetDrawerContentStylesProps {
  position?: DrawerPosition;
  size?: DrawerSize;
  className?: string;
}

/** Base classes shared by every drawer content panel. */
const CONTENT_BASE_CLASSES =
  "fixed bg-[var(--color-bg-elevated)] shadow-[var(--shadow-xl)] flex flex-col";

/**
 * Returns a single, merged class string for the drawer content panel.
 *
 * Size classes depend on whether the drawer is horizontal (left/right)
 * or vertical (top/bottom).
 *
 * @param props - Subset of drawer props that influence styling.
 * @returns Merged Tailwind class string.
 */
export function getDrawerContentStyles(props: GetDrawerContentStylesProps): string {
  const {
    position = "right",
    size = "md",
    className,
  } = props;

  const isHorizontal = position === "left" || position === "right";
  const sizeClass = isHorizontal
    ? drawerHorizontalSizeStyles[size]
    : drawerVerticalSizeStyles[size];

  return cn(
    CONTENT_BASE_CLASSES,
    drawerPositionStyles[position],
    sizeClass,
    className,
  );
}

// ---------------------------------------------------------------------------
// Header styles
// ---------------------------------------------------------------------------

/**
 * Returns the Tailwind class string for the drawer header.
 */
export function getDrawerHeaderStyles(): string {
  return cn(
    "flex items-center justify-between",
    "px-6 py-4",
    "border-b border-b-[var(--color-border)]",
  );
}

// ---------------------------------------------------------------------------
// Body styles
// ---------------------------------------------------------------------------

/**
 * Returns the Tailwind class string for the drawer body / content area.
 */
export function getDrawerBodyStyles(): string {
  return cn(
    "flex-1 overflow-auto",
    "px-6 py-4",
  );
}

// ---------------------------------------------------------------------------
// Close button styles
// ---------------------------------------------------------------------------

/**
 * Returns the Tailwind class string for the drawer close button.
 */
export function getDrawerCloseButtonStyles(): string {
  return cn(
    "inline-flex items-center justify-center",
    "h-8 w-8 rounded-[var(--radius-md)]",
    "text-[var(--color-text-secondary)]",
    "hover:bg-[var(--color-bg-secondary)]",
    "hover:text-[var(--color-text)]",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
  );
}

// ---------------------------------------------------------------------------
// Resize handle styles
// ---------------------------------------------------------------------------

/**
 * Returns the Tailwind class string for the drawer resize handle.
 * The handle is positioned on the edge opposite to the drawer's anchor.
 */
export function getDrawerResizeHandleStyles(
  position: DrawerPosition,
): string {
  const base = cn(
    "absolute bg-transparent hover:bg-[var(--color-primary)]/20 active:bg-[var(--color-primary)]/30",
    "transition-colors group/resize z-10",
  );

  switch (position) {
    case "left":
      return cn(base, "top-0 right-0 w-1 h-full cursor-ew-resize");
    case "right":
      return cn(base, "top-0 left-0 w-1 h-full cursor-ew-resize");
    case "top":
      return cn(base, "bottom-0 left-0 h-1 w-full cursor-ns-resize");
    case "bottom":
      return cn(base, "top-0 left-0 h-1 w-full cursor-ns-resize");
  }
}
