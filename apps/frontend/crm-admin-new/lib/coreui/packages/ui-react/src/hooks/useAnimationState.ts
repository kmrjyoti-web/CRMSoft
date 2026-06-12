/**
 * React hook for managing animation lifecycle states.
 * Coordinates mount/unmount timing with CSS transitions.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { AnimationState } from "@coreui/ui";

/** Return value from the useAnimationState hook. */
export interface UseAnimationStateReturn {
  /** Current animation lifecycle state. */
  state: AnimationState;
  /** Whether the component should be mounted in the DOM. */
  isMounted: boolean;
}

/**
 * Manages the animation lifecycle for enter/exit transitions.
 *
 * The state transitions are:
 * - Open request:  exited -> entering -> entered
 * - Close request: entered -> exiting -> exited (then unmount)
 *
 * @param isOpen   - Whether the component should be visible.
 * @param duration - Animation duration in milliseconds (default: 200).
 * @returns Object with current animation state and mount status.
 */
export function useAnimationState(
  isOpen: boolean,
  duration: number = 200,
): UseAnimationStateReturn {
  const [state, setState] = useState<AnimationState>(
    isOpen ? "entered" : "exited",
  );
  const [isMounted, setIsMounted] = useState(isOpen);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearExistingTimeout();

    if (isOpen) {
      // Mount immediately, then transition entering -> entered
      setIsMounted(true);
      setState("entering");

      // Use requestAnimationFrame to ensure the entering state is painted
      // before transitioning to entered
      const rafId = requestAnimationFrame(() => {
        timeoutRef.current = setTimeout(() => {
          setState("entered");
        }, 16); // Small delay to allow CSS transition to trigger
      });

      return () => {
        cancelAnimationFrame(rafId);
        clearExistingTimeout();
      };
    } else {
      // Transition exiting -> exited, then unmount
      setState("exiting");

      timeoutRef.current = setTimeout(() => {
        setState("exited");
        setIsMounted(false);
      }, duration);

      return () => {
        clearExistingTimeout();
      };
    }
  }, [isOpen, duration, clearExistingTimeout]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      clearExistingTimeout();
    };
  }, [clearExistingTimeout]);

  return { state, isMounted };
}
