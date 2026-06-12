/**
 * Modal style composition.
 * Combines base classes, size, mode, and custom className into
 * Tailwind class strings for each modal section.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import { modalSizeStyles, modalModeBaseStyles } from "./modal.variants";
import type { ModalSize, ModalMode } from "./modal.types";

// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------

export interface GetModalOverlayStylesConfig {
  blur?: boolean;
}

/**
 * Returns the class string for the modal overlay / backdrop.
 *
 * @param config - Optional configuration (e.g. blur).
 * @returns Merged Tailwind class string for the overlay.
 */
export function getModalOverlayStyles(
  config: GetModalOverlayStylesConfig = {},
): string {
  const { blur = false } = config;

  return cn(
    "fixed inset-0 bg-[var(--color-bg-overlay)] z-50",
    blur && "backdrop-blur-sm",
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface GetModalContentStylesProps {
  size?: ModalSize;
  mode?: ModalMode;
  className?: string;
}

const CONTENT_BASE_CLASSES =
  "relative bg-[var(--color-bg-primary)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full flex flex-col overflow-hidden z-50";

/**
 * Returns the class string for the modal content panel.
 * Composes base, size, mode, and consumer className.
 *
 * @param props - Size, mode, and optional className.
 * @returns Merged Tailwind class string.
 */
export function getModalContentStyles(
  props: GetModalContentStylesProps = {},
): string {
  const { size = "md", mode = "center", className } = props;

  return cn(
    CONTENT_BASE_CLASSES,
    modalSizeStyles[size],
    modalModeBaseStyles[mode],
    className,
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

/**
 * Returns the class string for the modal header section.
 */
export function getModalHeaderStyles(): string {
  return cn(
    "flex items-start justify-between px-6 pt-6 pb-2",
  );
}

// ---------------------------------------------------------------------------
// Body
// ---------------------------------------------------------------------------

/**
 * Returns the class string for the modal body section.
 */
export function getModalBodyStyles(): string {
  return cn(
    "flex-1 px-6 py-4 overflow-y-auto",
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

/**
 * Returns the class string for the modal footer section.
 */
export function getModalFooterStyles(): string {
  return cn(
    "flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]",
  );
}

// ---------------------------------------------------------------------------
// Close button
// ---------------------------------------------------------------------------

/**
 * Returns the class string for the modal close (X) button.
 */
export function getModalCloseButtonStyles(): string {
  return cn(
    "absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)]",
    "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]",
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
  );
}
