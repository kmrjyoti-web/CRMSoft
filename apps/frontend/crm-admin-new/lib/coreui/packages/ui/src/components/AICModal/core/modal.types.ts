/**
 * Modal component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// Size & Mode unions
// ---------------------------------------------------------------------------

/** Available size presets for the Modal component. */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/** Display mode that determines layout and animation behaviour. */
export type ModalMode = "center" | "slide-panel" | "top-dropdown";

// ---------------------------------------------------------------------------
// ModalProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Modal component.
 *
 * `OnClose` is purposely generic so each framework adapter can supply its
 * own callback signature.
 */
export interface ModalProps<OnClose = () => void> {
  /** Whether the modal is currently open. */
  open?: boolean;
  /** Callback invoked when the modal requests to close. */
  onClose?: OnClose;
  /** Title displayed in the modal header. */
  title?: string;
  /** Description text displayed below the title. */
  description?: string;
  /** Size preset controlling the maximum width. */
  size?: ModalSize;
  /** Display mode controlling layout and animation style. */
  mode?: ModalMode;
  /** Whether clicking the overlay backdrop closes the modal. */
  closeOnOverlay?: boolean;
  /** Whether pressing Escape closes the modal. */
  closeOnEscape?: boolean;
  /** Whether to render a close (X) button in the header. */
  showCloseButton?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** Unique identifier for the modal element. */
  id?: string;
}
