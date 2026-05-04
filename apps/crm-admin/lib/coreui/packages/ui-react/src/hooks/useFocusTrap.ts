/**
 * React hook for focus trapping.
 * Manages focus within a container element, preventing tab navigation
 * from escaping to elements outside the container.
 */

import { useEffect, useRef, useCallback } from "react";
import {
  focusTrapReducer,
  initialFocusTrapState,
  resolveFocusTrapConfig,
} from "@coreui/ui";
import type { FocusTrapConfig, FocusTrapState, FocusTrapAction, FocusIntent } from "@coreui/ui";

/** Selector for all focusable elements within a container. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Returns all focusable elements within a container.
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * Executes a focus intent by moving focus to the appropriate element.
 */
function executeFocusIntent(
  intent: FocusIntent,
  container: HTMLElement | null,
  previouslyFocused: HTMLElement | null,
): void {
  if (intent === "none") return;

  if (intent === "restore") {
    previouslyFocused?.focus();
    return;
  }

  if (!container) return;
  const focusables = getFocusableElements(container);
  if (focusables.length === 0) {
    // Focus the container itself if no focusable children exist
    container.focus();
    return;
  }

  switch (intent) {
    case "first":
    case "wrap-to-first":
      focusables[0].focus();
      break;
    case "last":
    case "wrap-to-last":
      focusables[focusables.length - 1].focus();
      break;
  }
}

/**
 * Hook that traps focus within a container element.
 *
 * @param containerRef - React ref to the container element.
 * @param isActive     - Whether the focus trap is currently active.
 * @param config       - Optional focus trap configuration overrides.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean,
  config?: Partial<FocusTrapConfig>,
): void {
  const resolvedConfig = resolveFocusTrapConfig(config);
  const stateRef = useRef<FocusTrapState>(initialFocusTrapState);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const dispatch = useCallback(
    (action: FocusTrapAction) => {
      const nextState = focusTrapReducer(stateRef.current, action, resolvedConfig);
      stateRef.current = nextState;

      if (nextState.focusIntent !== "none") {
        executeFocusIntent(
          nextState.focusIntent,
          containerRef.current,
          previouslyFocusedRef.current,
        );
        // Clear the intent after executing
        stateRef.current = focusTrapReducer(
          stateRef.current,
          { type: "FOCUS_INTENT_HANDLED" },
          resolvedConfig,
        );
      }
    },
    [containerRef, resolvedConfig],
  );

  // Activate / deactivate based on isActive prop
  useEffect(() => {
    if (isActive) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      dispatch({ type: "ACTIVATE" });
    } else if (stateRef.current.isActive) {
      dispatch({ type: "DEACTIVATE" });
    }
  }, [isActive, dispatch]);

  // Handle keydown for tab trapping and escape
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch({ type: "ESCAPE" });
        return;
      }

      if (event.key === "Tab") {
        const container = containerRef.current;
        if (!container) return;

        const focusables = getFocusableElements(container);
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }

        const activeElement = document.activeElement as HTMLElement;
        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (event.shiftKey) {
          dispatch({
            type: "TAB_BACKWARD",
            isFirstElement: activeElement === firstElement,
          });
          if (activeElement === firstElement) {
            event.preventDefault();
          }
        } else {
          dispatch({
            type: "TAB_FORWARD",
            isLastElement: activeElement === lastElement,
          });
          if (activeElement === lastElement) {
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, containerRef, dispatch]);
}
