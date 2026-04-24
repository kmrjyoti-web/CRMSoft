/**
 * AICDrawer component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular aic-drawer.component.ts
 */

// ---------------------------------------------------------------------------
// Mode & Position
// ---------------------------------------------------------------------------

/** Display mode — either a slide-in drawer or a floating modal. */
export type AICDrawerMode = "drawer" | "modal";

/** Position of the panel within the viewport. */
export type AICDrawerPosition =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

// ---------------------------------------------------------------------------
// Button types
// ---------------------------------------------------------------------------

/** Footer action button configuration. */
export interface AICDrawerButton {
  label: string;
  class?: string;
  variant?: "primary" | "secondary" | "danger";
  action?: string | (() => void);
  disabled?: boolean;
}

/** Header icon-button configuration. */
export interface AICDrawerHeaderButton {
  icon: string;
  action: string | (() => void);
  title?: string;
}

// ---------------------------------------------------------------------------
// AICDrawerConfig — framework-agnostic configuration
// ---------------------------------------------------------------------------

export interface AICDrawerConfig {
  /** Unique identifier for the drawer instance. */
  id?: string;
  /** Display mode: drawer (slide-in) or modal (floating). */
  mode?: AICDrawerMode;
  /** Title displayed in the header. */
  title?: string;
  /** Icon name displayed next to the title. */
  icon?: string;
  /** Width of the panel (CSS value or number in px). */
  width?: string | number;
  /** Height of the panel (CSS value or number in px). */
  height?: string | number;
  /** Position within the viewport. */
  position?: AICDrawerPosition;
  /** Whether to show a loading skeleton in the body. */
  isLoading?: boolean;
  /** Whether to show a backdrop overlay behind the panel. */
  hasBackdrop?: boolean;
  /** Whether to show the close button. */
  showClose?: boolean;
  /** Whether to show the minimize button. */
  showMinimize?: boolean;
  /** Whether to show the maximize button. */
  showMaximize?: boolean;
  /** Whether to show the open-in-new-tab button. */
  showNewTab?: boolean;
  /** Extra icon buttons rendered in the header. */
  headerIconButtons?: AICDrawerHeaderButton[];
  /** Action buttons rendered in the footer. */
  footerButtons?: AICDrawerButton[];
}

// ---------------------------------------------------------------------------
// AICDrawerProps — extended with interaction callbacks (framework-agnostic)
// ---------------------------------------------------------------------------

export interface AICDrawerProps {
  /** Whether the drawer is currently open. */
  isOpen: boolean;
  /** Configuration object for the drawer. */
  config?: AICDrawerConfig;
  /** Title shorthand (overrides config.title). */
  title?: string;
  /** Callback invoked when the drawer should close. */
  onClose?: () => void;
  /** Callback invoked when a footer button with a string action is clicked. */
  onFooterAction?: (action: string) => void;
  /** Additional CSS class name(s). */
  className?: string;
}
