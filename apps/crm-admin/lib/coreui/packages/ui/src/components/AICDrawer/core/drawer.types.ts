/**
 * Drawer component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// Position & Size unions
// ---------------------------------------------------------------------------

/** Edge of the screen from which the drawer slides in. */
export type DrawerPosition = "left" | "right" | "top" | "bottom";

/** Size presets for the drawer. */
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

// ---------------------------------------------------------------------------
// DrawerProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Drawer component.
 *
 * `OnClose` is purposely generic so each framework adapter can supply its
 * own callback signature.
 */
export interface DrawerProps<OnClose = () => void> {
  /** Whether the drawer is open. */
  open?: boolean;
  /** Callback invoked when the drawer should close. */
  onClose?: OnClose;
  /** Edge from which the drawer slides in. */
  position?: DrawerPosition;
  /** Size preset for the drawer. */
  size?: DrawerSize;
  /** Whether to show the backdrop overlay. */
  showOverlay?: boolean;
  /** Whether clicking the overlay should close the drawer. */
  closeOnOverlay?: boolean;
  /** Whether pressing Escape should close the drawer. */
  closeOnEscape?: boolean;
  /** Title text displayed in the drawer header. */
  title?: string;
  /** Whether to show the close button in the header. */
  showCloseButton?: boolean;
  /** Whether the drawer can be resized by dragging. */
  resizable?: boolean;
  /** Minimum size in pixels when resizing. */
  minSize?: number;
  /** Maximum size in pixels when resizing. */
  maxSize?: number;
  /** Additional CSS class name(s). */
  className?: string;
  /** Unique identifier for the drawer element. */
  id?: string;
}
