/**
 * React AICModal component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, { useCallback, useRef, useId, useEffect } from "react";

import {
  getModalOverlayStyles,
  getModalContentStyles,
  getModalHeaderStyles,
  getModalBodyStyles,
  getModalFooterStyles,
  getModalCloseButtonStyles,
  getModalA11yProps,
  getModalKeyboardHandlers,
  modalModeAnimations,
} from "@coreui/ui";

import type {
  ModalSize,
  ModalMode,
  ModalAction,
  AnimationType,
} from "@coreui/ui";

import { getAnimationClasses } from "@coreui/ui";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useAnimationState } from "../../hooks/useAnimationState";
import { AICPortal } from "../AICPortal";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICModal props.
 * Extends the core modal props with React-specific content slots.
 */
export interface ModalProps {
  /** Whether the modal is currently open. */
  open?: boolean;
  /** Callback invoked when the modal requests to close. */
  onClose?: () => void;
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
  /** Custom header content. Overrides the default title/close button header. */
  header?: React.ReactNode;
  /** Custom footer content (e.g. action buttons). */
  footer?: React.ReactNode;
  /** Additional CSS class name(s) for the modal content panel. */
  className?: string;
  /** Unique identifier for the modal element. */
  id?: string;
  /** AICModal body content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICModal built on the shared core logic from `@coreui/ui`.
 *
 * Renders a modal dialog in a AICPortal with overlay backdrop, focus trapping,
 * scroll locking, and enter/exit animations. Supports three display modes:
 * center (default), slide-panel (right-side drawer), and top-dropdown.
 */
export const AICModal: React.FC<ModalProps> = (props) => {
  const {
    open = false,
    onClose,
    title,
    description,
    size = "md",
    mode = "center",
    closeOnOverlay = true,
    closeOnEscape = true,
    showCloseButton = true,
    header,
    footer,
    className,
    id: externalId,
    children,
  } = props;

  // -----------------------------------------------------------------------
  // Unique ID
  // -----------------------------------------------------------------------

  const autoId = useId();
  const modalId = externalId ?? `modal-${autoId}`;

  // -----------------------------------------------------------------------
  // Refs
  // -----------------------------------------------------------------------

  const contentRef = useRef<HTMLDivElement>(null);

  // -----------------------------------------------------------------------
  // Focus trap & scroll lock
  // -----------------------------------------------------------------------

  useFocusTrap(contentRef, open);
  useScrollLock(open);

  // -----------------------------------------------------------------------
  // Animation
  // -----------------------------------------------------------------------

  const animationType: AnimationType = modalModeAnimations[mode];
  const { state: animState, isMounted } = useAnimationState(open, 200);

  // -----------------------------------------------------------------------
  // Keyboard handlers
  // -----------------------------------------------------------------------

  const keyMap = getModalKeyboardHandlers();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const actionType = keyMap[e.key] as ModalAction["type"] | undefined;
      if (actionType === "ESCAPE" && closeOnEscape) {
        e.stopPropagation();
        onClose?.();
      }
    },
    [keyMap, closeOnEscape, onClose],
  );

  // -----------------------------------------------------------------------
  // Overlay click handler
  // -----------------------------------------------------------------------

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if the click target is the overlay itself, not a child
      if (e.target === e.currentTarget && closeOnOverlay) {
        onClose?.();
      }
    },
    [closeOnOverlay, onClose],
  );

  // -----------------------------------------------------------------------
  // Close button handler
  // -----------------------------------------------------------------------

  const handleCloseClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const overlayClasses = getModalOverlayStyles({ blur: true });
  const contentClasses = getModalContentStyles({ size, mode, className });
  const headerClasses = getModalHeaderStyles();
  const bodyClasses = getModalBodyStyles();
  const footerClasses = getModalFooterStyles();
  const closeButtonClasses = getModalCloseButtonStyles();

  // -----------------------------------------------------------------------
  // A11y
  // -----------------------------------------------------------------------

  const a11yProps = getModalA11yProps({
    id: modalId,
    title,
    description,
  });

  // -----------------------------------------------------------------------
  // Animation classes
  // -----------------------------------------------------------------------

  const animationClasses = getAnimationClasses(
    { type: animationType, duration: "normal" },
    animState,
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (!isMounted) {
    return null;
  }

  const hasTitle = title !== undefined && title !== "";
  const hasDescription = description !== undefined && description !== "";
  const hasHeader = header !== undefined || hasTitle || showCloseButton;

  return (
    <AICPortal level="modal">
      {/* Overlay */}
      <div
        className={`${overlayClasses} flex items-center justify-center transition-opacity duration-200 ${
          animState === "entering" || animState === "entered"
            ? "opacity-100"
            : "opacity-0"
        }`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      >
        {/* Content */}
        <div
          ref={contentRef}
          className={`${contentClasses} ${animationClasses.base} ${animationClasses.state}`}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          {...a11yProps}
        >
          {/* Header */}
          {hasHeader && (
            <div className={headerClasses}>
              {header ?? (
                <div className="flex-1 min-w-0">
                  {hasTitle && (
                    <h2
                      id={`${modalId}-title`}
                      className="text-lg font-semibold text-[var(--color-text)] leading-tight truncate"
                    >
                      {title}
                    </h2>
                  )}
                  {hasDescription && (
                    <p
                      id={`${modalId}-description`}
                      className="mt-1 text-sm text-[var(--color-text-secondary)] leading-normal"
                    >
                      {description}
                    </p>
                  )}
                </div>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className={closeButtonClasses}
                  onClick={handleCloseClick}
                  aria-label="Close modal"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={bodyClasses}>{children}</div>

          {/* Footer */}
          {footer && <div className={footerClasses}>{footer}</div>}
        </div>
      </div>
    </AICPortal>
  );
};

AICModal.displayName = "AICModal";
