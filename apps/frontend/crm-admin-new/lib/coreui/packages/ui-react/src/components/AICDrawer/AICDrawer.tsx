/**
 * React AICDrawer component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, { useReducer, useCallback, useEffect, useRef, useMemo, useState } from "react";

import {
  getDrawerOverlayStyles,
  getDrawerContentStyles,
  getDrawerHeaderStyles,
  getDrawerBodyStyles,
  getDrawerCloseButtonStyles,
  getDrawerResizeHandleStyles,
  getDrawerA11yProps,
  getDrawerKeyboardHandlers,
  drawerReducer,
  initialDrawerState,
  drawerPositionAnimations,
  getAnimationClasses,
} from "@coreui/ui";

import type {
  DrawerPosition,
  DrawerSize,
  DrawerAction,
  DrawerInternalState,
  AnimationState,
} from "@coreui/ui";

import { AICPortal } from "../AICPortal";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useAnimationState } from "../../hooks/useAnimationState";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICDrawer props.
 * - `children` accepts any `ReactNode`.
 */
export interface DrawerProps {
  /** Whether the drawer is open. */
  open?: boolean;
  /** Callback invoked when the drawer should close. */
  onClose?: () => void;
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
  /** AICDrawer content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICDrawer built on the shared core logic from `@coreui/ui`.
 *
 * Features:
 * - Slide-in animation from any screen edge
 * - Focus trapping when open
 * - Body scroll lock when open
 * - Keyboard (Escape) and overlay click dismissal
 * - AICPortal rendering at the modal z-index level
 */
export const AICDrawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (props, ref) => {
    const {
      open = false,
      onClose,
      position = "right",
      size = "md",
      showOverlay = true,
      closeOnOverlay = true,
      closeOnEscape = true,
      title,
      showCloseButton = true,
      resizable = false,
      minSize = 200,
      maxSize = 800,
      className,
      id = "drawer",
      children,
    } = props;

    // -----------------------------------------------------------------------
    // Internal state
    // -----------------------------------------------------------------------

    const reducerConfig = useMemo(
      () => ({ closeOnOverlay, closeOnEscape }),
      [closeOnOverlay, closeOnEscape],
    );

    const [_internalState, dispatch] = useReducer(
      (state: DrawerInternalState, action: DrawerAction) =>
        drawerReducer(state, action, reducerConfig),
      initialDrawerState,
    );

    // -----------------------------------------------------------------------
    // Resize state
    // -----------------------------------------------------------------------

    const [customSize, setCustomSize] = useState<number | null>(null);
    const isResizingRef = useRef(false);
    const startPosRef = useRef(0);
    const startSizeRef = useRef(0);

    const isHorizontal = position === "left" || position === "right";

    const handleResizeStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
        startPosRef.current = isHorizontal ? e.clientX : e.clientY;
        const el = contentRef.current;
        if (el) {
          startSizeRef.current = isHorizontal ? el.offsetWidth : el.offsetHeight;
        }

        const handleResizeMove = (moveEvent: MouseEvent) => {
          if (!isResizingRef.current) return;
          const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
          const delta = position === "right" || position === "bottom"
            ? startPosRef.current - currentPos
            : currentPos - startPosRef.current;
          const newSize = Math.min(maxSize, Math.max(minSize, startSizeRef.current + delta));
          setCustomSize(newSize);
        };

        const handleResizeEnd = () => {
          isResizingRef.current = false;
          document.removeEventListener("mousemove", handleResizeMove);
          document.removeEventListener("mouseup", handleResizeEnd);
        };

        document.addEventListener("mousemove", handleResizeMove);
        document.addEventListener("mouseup", handleResizeEnd);
      },
      [isHorizontal, position, minSize, maxSize],
    );

    // Reset custom size when drawer closes
    useEffect(() => {
      if (!open) {
        setCustomSize(null);
      }
    }, [open]);

    // -----------------------------------------------------------------------
    // Animation
    // -----------------------------------------------------------------------

    const { state: animationState, isMounted } = useAnimationState(open, 200);

    // -----------------------------------------------------------------------
    // Focus trap & scroll lock
    // -----------------------------------------------------------------------

    const contentRef = useRef<HTMLDivElement>(null);
    useFocusTrap(contentRef, open);
    useScrollLock(open);

    // -----------------------------------------------------------------------
    // Keyboard handling
    // -----------------------------------------------------------------------

    const keyMap = getDrawerKeyboardHandlers();

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const actionType = keyMap[e.key] as DrawerAction["type"] | undefined;
        if (actionType) {
          e.preventDefault();
          dispatch({ type: actionType });
          if (actionType === "ESCAPE" && closeOnEscape) {
            onClose?.();
          }
        }
      },
      [keyMap, closeOnEscape, onClose],
    );

    // -----------------------------------------------------------------------
    // Overlay click
    // -----------------------------------------------------------------------

    const handleOverlayClick = useCallback(() => {
      dispatch({ type: "OVERLAY_CLICK" });
      if (closeOnOverlay) {
        onClose?.();
      }
    }, [closeOnOverlay, onClose]);

    // -----------------------------------------------------------------------
    // Close button click
    // -----------------------------------------------------------------------

    const handleCloseClick = useCallback(() => {
      dispatch({ type: "CLOSE" });
      onClose?.();
    }, [onClose]);

    // -----------------------------------------------------------------------
    // Sync open prop with internal state
    // -----------------------------------------------------------------------

    useEffect(() => {
      if (open) {
        dispatch({ type: "OPEN" });
      } else {
        dispatch({ type: "CLOSE" });
      }
    }, [open]);

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const a11yProps = getDrawerA11yProps({ id, title });

    const animationType = drawerPositionAnimations[position];
    const animationClasses = getAnimationClasses(
      { type: animationType, duration: "normal" },
      animationState as AnimationState,
    );

    const overlayAnimationClasses = getAnimationClasses(
      { type: "fade", duration: "normal" },
      animationState as AnimationState,
    );

    const resizeHandleStyles = resizable ? getDrawerResizeHandleStyles(position) : null;
    const contentStyles = getDrawerContentStyles({ position, size, className });
    const overlayStyles = getDrawerOverlayStyles();
    const headerStyles = getDrawerHeaderStyles();
    const bodyStyles = getDrawerBodyStyles();
    const closeButtonStyles = getDrawerCloseButtonStyles();

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    if (!isMounted) return null;

    return (
      <AICPortal level="modal">
        {/* Overlay */}
        {showOverlay && (
          <div
            className={`${overlayStyles} ${overlayAnimationClasses.base} ${overlayAnimationClasses.state}`}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <div
          ref={(node) => {
            // Support both internal ref and forwarded ref
            (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
          }}
          className={`${contentStyles} ${animationClasses.base} ${animationClasses.state}`}
          style={customSize != null ? (isHorizontal ? { width: `${customSize}px` } : { height: `${customSize}px` }) : undefined}
          onKeyDown={handleKeyDown}
          id={id}
          {...a11yProps}
        >
          {/* Resize handle */}
          {resizable && resizeHandleStyles && (
            <div
              className={resizeHandleStyles}
              onMouseDown={handleResizeStart}
              aria-hidden="true"
            />
          )}

          {/* Header */}
          {(title || showCloseButton) && (
            <div className={headerStyles}>
              {title ? (
                <h2
                  id={`${id}-title`}
                  className="text-lg font-semibold text-[var(--color-text)]"
                >
                  {title}
                </h2>
              ) : (
                <div />
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className={closeButtonStyles}
                  onClick={handleCloseClick}
                  aria-label="Close drawer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 4L4 12M4 4l8 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={bodyStyles}>
            {children}
          </div>
        </div>
      </AICPortal>
    );
  },
);

AICDrawer.displayName = "AICDrawer";
