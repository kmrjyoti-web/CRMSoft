/**
 * React hook for positioning floating content relative to a trigger element.
 *
 * Reads DOM measurements (getBoundingClientRect, window dimensions) and passes
 * plain numbers to the pure `computePosition()` function from @coreui/ui.
 */

import { useState, useEffect, useCallback } from "react";

import { computePosition } from "@coreui/ui";

import type {
  PositionConfig,
  ComputedPosition,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Config type extension
// ---------------------------------------------------------------------------

export interface UsePositionConfig extends PositionConfig {
  /** Whether positioning is enabled. When false, returns null. */
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Computes and tracks the position of floating content relative to a trigger.
 *
 * Recalculates on:
 * - `enabled` becoming true
 * - Window resize
 * - Window scroll
 *
 * @param triggerRef - Ref to the trigger element.
 * @param contentRef - Ref to the floating content element.
 * @param config     - Position config plus `enabled` flag.
 * @returns The computed position or null when disabled / not measurable.
 */
export function usePosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  contentRef: React.RefObject<HTMLElement | null>,
  config: UsePositionConfig,
): ComputedPosition | null {
  const [position, setPosition] = useState<ComputedPosition | null>(null);

  const { enabled, ...positionConfig } = config;

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const contentEl = contentRef.current;

    if (!triggerEl || !contentEl) {
      setPosition(null);
      return;
    }

    const triggerRect = triggerEl.getBoundingClientRect();
    const contentRect = contentEl.getBoundingClientRect();

    const trigger = {
      top: triggerRect.top,
      left: triggerRect.left,
      width: triggerRect.width,
      height: triggerRect.height,
    };

    const content = {
      width: contentRect.width,
      height: contentRect.height,
    };

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const computed = computePosition(trigger, content, viewport, positionConfig);
    setPosition(computed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    triggerRef,
    contentRef,
    positionConfig.placement,
    positionConfig.offset,
    positionConfig.padding,
    positionConfig.flip,
    positionConfig.shift,
    positionConfig.arrow,
  ]);

  useEffect(() => {
    if (!enabled) {
      setPosition(null);
      return;
    }

    // Initial calculation
    updatePosition();

    // Recalculate on resize and scroll
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [enabled, updatePosition]);

  return position;
}
