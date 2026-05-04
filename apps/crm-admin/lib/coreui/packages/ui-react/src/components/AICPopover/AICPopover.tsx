/**
 * React AICPopover component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, {
  useCallback,
  useRef,
  useId,
  useEffect,
  useState,
} from "react";

import {
  getPopoverContentStyles,
  getPopoverArrowStyles,
  getPopoverA11yProps,
  getPopoverTriggerA11yProps,
  popoverReducer,
  initialPopoverState,
} from "@coreui/ui";

import type {
  Placement,
  PopoverTrigger,
  PopoverInternalState,
  PopoverAction,
  PopoverReducerConfig,
} from "@coreui/ui";

import { useAnimationState } from "../../hooks/useAnimationState";
import { usePosition } from "../../hooks/usePosition";
import { AICPortal } from "../AICPortal";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICPopover props.
 * The `children` prop must be a single React element that serves as the
 * trigger. The popover clones it to attach event handlers and refs.
 */
export interface PopoverProps {
  /** Activation method for showing the popover. */
  trigger?: PopoverTrigger;
  /** Content rendered inside the popover body. */
  content: React.ReactNode;
  /** Preferred placement relative to the trigger element. */
  placement?: Placement;
  /** Whether to show an arrow pointing to the trigger. */
  arrow?: boolean;
  /** Offset distance from the trigger in pixels. */
  offset?: number;
  /** Whether clicking outside the popover closes it. */
  closeOnOutsideClick?: boolean;
  /** Whether pressing Escape closes the popover. */
  closeOnEscape?: boolean;
  /** Controlled open state. When provided, the component is controlled. */
  open?: boolean;
  /** Additional CSS class name(s) for the popover container. */
  className?: string;
  /** Unique identifier for the popover element. */
  id?: string;
  /** The trigger element. Must be a single React element. */
  children: React.ReactElement;
  /** Callback invoked when the popover open state changes. */
  onOpenChange?: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICPopover built on the shared core logic from `@coreui/ui`.
 *
 * Renders a floating popover dialog in a AICPortal when triggered. Supports
 * click, hover, focus, and manual trigger modes, as well as controlled
 * and uncontrolled open state.
 */
export const AICPopover: React.FC<PopoverProps> = (props) => {
  const {
    trigger = "click",
    content,
    placement = "bottom",
    arrow = true,
    offset = 8,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    open: controlledOpen,
    className,
    id: externalId,
    children,
    onOpenChange,
  } = props;

  // -----------------------------------------------------------------------
  // Controlled vs uncontrolled
  // -----------------------------------------------------------------------

  const isControlled = controlledOpen !== undefined;

  // -----------------------------------------------------------------------
  // Unique ID
  // -----------------------------------------------------------------------

  const autoId = useId();
  const popoverId = externalId ?? `popover-${autoId}`;

  // -----------------------------------------------------------------------
  // Refs
  // -----------------------------------------------------------------------

  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // -----------------------------------------------------------------------
  // Internal state (used for uncontrolled mode)
  // -----------------------------------------------------------------------

  const reducerConfig: PopoverReducerConfig = {
    closeOnOutsideClick,
    closeOnEscape,
  };

  const [internalState, setInternalState] = useState<PopoverInternalState>(
    initialPopoverState,
  );

  const dispatchAction = useCallback(
    (action: PopoverAction) => {
      if (isControlled) {
        // In controlled mode, only fire the callback; don't manage state
        switch (action.type) {
          case "OPEN":
            onOpenChange?.(true);
            break;
          case "CLOSE":
            onOpenChange?.(false);
            break;
          case "TOGGLE":
            onOpenChange?.(!controlledOpen);
            break;
          case "ESCAPE":
            if (closeOnEscape) onOpenChange?.(false);
            break;
          case "CLICK_OUTSIDE":
            if (closeOnOutsideClick) onOpenChange?.(false);
            break;
        }
      } else {
        const nextState = popoverReducer(internalState, action, reducerConfig);
        if (nextState !== internalState) {
          setInternalState(nextState);
          onOpenChange?.(nextState.isOpen);
        }
      }
    },
    [
      isControlled,
      controlledOpen,
      internalState,
      reducerConfig,
      closeOnEscape,
      closeOnOutsideClick,
      onOpenChange,
    ],
  );

  const isOpen = isControlled ? !!controlledOpen : internalState.isOpen;

  // -----------------------------------------------------------------------
  // Animation & Positioning
  // -----------------------------------------------------------------------

  const { state: animState, isMounted } = useAnimationState(isOpen, 150);

  const position = usePosition(triggerRef, contentRef, {
    placement,
    offset,
    enabled: isMounted,
  });

  // -----------------------------------------------------------------------
  // Click outside handler
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideContent =
        contentRef.current && contentRef.current.contains(target);
      const isInsideTrigger =
        triggerRef.current && triggerRef.current.contains(target);

      if (!isInsideContent && !isInsideTrigger) {
        dispatchAction({ type: "CLICK_OUTSIDE" });
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen, closeOnOutsideClick, dispatchAction]);

  // -----------------------------------------------------------------------
  // Escape handler
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatchAction({ type: "ESCAPE" });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEscape, dispatchAction]);

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  const handleClick = useCallback(() => {
    if (trigger === "click") {
      dispatchAction({ type: "TOGGLE" });
    }
  }, [trigger, dispatchAction]);

  const handleMouseEnter = useCallback(() => {
    if (trigger === "hover") {
      dispatchAction({ type: "OPEN" });
    }
  }, [trigger, dispatchAction]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === "hover") {
      dispatchAction({ type: "CLOSE" });
    }
  }, [trigger, dispatchAction]);

  const handleFocus = useCallback(() => {
    if (trigger === "focus") {
      dispatchAction({ type: "OPEN" });
    }
  }, [trigger, dispatchAction]);

  const handleBlur = useCallback(() => {
    if (trigger === "focus") {
      dispatchAction({ type: "CLOSE" });
    }
  }, [trigger, dispatchAction]);

  // -----------------------------------------------------------------------
  // Clone trigger child
  // -----------------------------------------------------------------------

  const child = React.Children.only(children);

  const triggerA11y = getPopoverTriggerA11yProps({
    id: popoverId,
    isOpen,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childProps = child.props as any;

  const triggerElement = React.cloneElement(child, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent) => {
      handleClick();
      childProps.onClick?.(e);
    },
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

  const popoverClasses = getPopoverContentStyles({ className });
  const popoverA11y = getPopoverA11yProps({ id: popoverId });
  const arrowClasses = arrow ? getPopoverArrowStyles(placement) : null;

  // -----------------------------------------------------------------------
  // Animation classes
  // -----------------------------------------------------------------------

  const animationClass =
    animState === "entering" || animState === "entered"
      ? "opacity-100 scale-100"
      : "opacity-0 scale-95";

  // -----------------------------------------------------------------------
  // Hover mode: keep popover open when hovering over content
  // -----------------------------------------------------------------------

  const contentMouseEnter = useCallback(() => {
    if (trigger === "hover") {
      dispatchAction({ type: "OPEN" });
    }
  }, [trigger, dispatchAction]);

  const contentMouseLeave = useCallback(() => {
    if (trigger === "hover") {
      dispatchAction({ type: "CLOSE" });
    }
  }, [trigger, dispatchAction]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <>
      {triggerElement}

      {isMounted && (
        <AICPortal level="dropdown">
          <div
            ref={contentRef}
            className={`${popoverClasses} absolute transition-all duration-150 ${animationClass}`}
            style={
              position
                ? { top: `${position.top}px`, left: `${position.left}px` }
                : { top: 0, left: 0, visibility: "hidden" as const }
            }
            onMouseEnter={contentMouseEnter}
            onMouseLeave={contentMouseLeave}
            {...popoverA11y}
          >
            {content}
            {arrow && arrowClasses && (
              <span className={arrowClasses} aria-hidden="true" />
            )}
          </div>
        </AICPortal>
      )}
    </>
  );
};

AICPopover.displayName = "AICPopover";
