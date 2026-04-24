/**
 * React AICTooltip component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, {
  useReducer,
  useCallback,
  useRef,
  useId,
  useEffect,
} from "react";

import {
  getTooltipStyles,
  getTooltipInlineStyles,
  getTooltipArrowStyles,
  getTooltipA11yProps,
  getTooltipTriggerA11yProps,
  tooltipReducer,
  initialTooltipState,
} from "@coreui/ui";

import type { Placement, TooltipTrigger } from "@coreui/ui";

import { useAnimationState } from "../../hooks/useAnimationState";
import { usePosition } from "../../hooks/usePosition";
import { AICPortal } from "../AICPortal";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICTooltip props.
 * The `children` prop must be a single React element that serves as the
 * trigger. The tooltip clones it to attach event handlers and refs.
 */
export interface TooltipProps {
  /** Text content displayed inside the tooltip. */
  content: string;
  /** Preferred placement relative to the trigger element. */
  placement?: Placement;
  /** Activation method for showing the tooltip. */
  trigger?: TooltipTrigger;
  /** Delay in milliseconds before the tooltip appears. */
  delay?: number;
  /** Maximum width of the tooltip in pixels. */
  maxWidth?: number;
  /** Additional CSS class name(s) for the tooltip container. */
  className?: string;
  /** Unique identifier for the tooltip element. */
  id?: string;
  /** The trigger element. Must be a single React element. */
  children: React.ReactElement;
  /** Callback invoked when the tooltip open state changes. */
  onOpenChange?: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICTooltip built on the shared core logic from `@coreui/ui`.
 *
 * Renders a floating tooltip in a AICPortal when the trigger element is
 * hovered or focused. Supports configurable delay, placement, and
 * trigger modes.
 */
export const AICTooltip: React.FC<TooltipProps> = (props) => {
  const {
    content,
    placement = "top",
    trigger = "both",
    delay = 200,
    maxWidth = 250,
    className,
    id: externalId,
    children,
    onOpenChange,
  } = props;

  // -----------------------------------------------------------------------
  // Unique ID
  // -----------------------------------------------------------------------

  const autoId = useId();
  const tooltipId = externalId ?? `tooltip-${autoId}`;

  // -----------------------------------------------------------------------
  // Refs
  // -----------------------------------------------------------------------

  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -----------------------------------------------------------------------
  // Internal state
  // -----------------------------------------------------------------------

  const [state, dispatch] = useReducer(tooltipReducer, initialTooltipState);

  // Track previous open state to fire onOpenChange
  const prevOpenRef = useRef(state.isOpen);
  useEffect(() => {
    if (prevOpenRef.current !== state.isOpen) {
      prevOpenRef.current = state.isOpen;
      onOpenChange?.(state.isOpen);
    }
  }, [state.isOpen, onOpenChange]);

  // -----------------------------------------------------------------------
  // Animation & Positioning
  // -----------------------------------------------------------------------

  const { state: animState, isMounted } = useAnimationState(state.isOpen, 150);

  const position = usePosition(triggerRef, contentRef, {
    placement,
    offset: 8,
    enabled: isMounted,
  });

  // -----------------------------------------------------------------------
  // Delay helpers
  // -----------------------------------------------------------------------

  const clearDelay = useCallback(() => {
    if (delayTimerRef.current !== null) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
  }, []);

  const openWithDelay = useCallback(
    (action: Parameters<typeof dispatch>[0]) => {
      clearDelay();
      if (delay <= 0) {
        dispatch(action);
        return;
      }
      delayTimerRef.current = setTimeout(() => {
        dispatch(action);
        delayTimerRef.current = null;
      }, delay);
    },
    [delay, clearDelay],
  );

  const closeImmediate = useCallback(
    (action: Parameters<typeof dispatch>[0]) => {
      clearDelay();
      dispatch(action);
    },
    [clearDelay],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearDelay();
    };
  }, [clearDelay]);

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  const handleMouseEnter = useCallback(() => {
    if (trigger === "hover" || trigger === "both") {
      openWithDelay({ type: "MOUSE_ENTER" });
    }
  }, [trigger, openWithDelay]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === "hover" || trigger === "both") {
      closeImmediate({ type: "MOUSE_LEAVE" });
    }
  }, [trigger, closeImmediate]);

  const handleFocus = useCallback(() => {
    if (trigger === "focus" || trigger === "both") {
      openWithDelay({ type: "FOCUS" });
    }
  }, [trigger, openWithDelay]);

  const handleBlur = useCallback(() => {
    if (trigger === "focus" || trigger === "both") {
      closeImmediate({ type: "BLUR" });
    }
  }, [trigger, closeImmediate]);

  // -----------------------------------------------------------------------
  // Clone trigger child
  // -----------------------------------------------------------------------

  const child = React.Children.only(children);

  const triggerA11y = getTooltipTriggerA11yProps({
    id: tooltipId,
    isOpen: state.isOpen,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childProps = child.props as any;

  const triggerElement = React.cloneElement(child, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      childProps.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleFocus();
      childProps.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleBlur();
      childProps.onBlur?.(e);
    },
    ...triggerA11y,
  } as Record<string, unknown>);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const tooltipClasses = getTooltipStyles({ maxWidth, className });
  const tooltipInline = getTooltipInlineStyles(maxWidth);
  const arrowClasses = getTooltipArrowStyles(placement);
  const tooltipA11y = getTooltipA11yProps({ id: tooltipId });

  // -----------------------------------------------------------------------
  // Animation classes
  // -----------------------------------------------------------------------

  const animationClass =
    animState === "entering" || animState === "entered"
      ? "opacity-100 scale-100"
      : "opacity-0 scale-95";

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <>
      {triggerElement}

      {isMounted && (
        <AICPortal level="tooltip">
          <div
            ref={contentRef}
            className={`${tooltipClasses} absolute transition-all duration-150 ${animationClass}`}
            style={{
              ...tooltipInline,
              ...(position
                ? { top: `${position.top}px`, left: `${position.left}px` }
                : { top: 0, left: 0, visibility: "hidden" as const }),
            }}
            {...tooltipA11y}
          >
            {content}
            <span className={arrowClasses} aria-hidden="true" />
          </div>
        </AICPortal>
      )}
    </>
  );
};

AICTooltip.displayName = "AICTooltip";
