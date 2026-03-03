/**
 * React AICPortal component.
 * Renders children into a DOM node outside the parent component hierarchy
 * with proper z-index management.
 */

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { getPortalZIndex } from "@coreui/ui";
import type { PortalLevel } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PortalProps {
  /** Z-index level for the portal. */
  level?: PortalLevel;
  /** Optional DOM container element ID to portal into. Defaults to body. */
  containerId?: string;
  /** Whether to lock body scroll when portal is mounted. */
  lockScroll?: boolean;
  /** AICPortal content. */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Stacking counter — ensures nested portals at the same level get
// incrementing z-indices so later-mounted overlays stack on top.
// ---------------------------------------------------------------------------

let portalInstanceCounter = 0;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders children into a portal with proper z-index layering.
 *
 * Creates a wrapper div appended to the target container (defaults to
 * document.body) with the z-index corresponding to the given level.
 * Each portal instance at the same level gets an incrementing z-index
 * offset so that stacked modals layer correctly.
 */
export const AICPortal: React.FC<PortalProps> = ({
  level = "overlay",
  containerId,
  lockScroll = false,
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    const baseZIndex = getPortalZIndex(level);
    const instanceOffset = ++portalInstanceCounter;
    el.style.position = "relative";
    el.style.zIndex = String(baseZIndex + instanceOffset);
    el.setAttribute("data-portal-level", level);

    const container = containerId
      ? document.getElementById(containerId) ?? document.body
      : document.body;

    container.appendChild(el);
    elRef.current = el;
    setMounted(true);

    return () => {
      container.removeChild(el);
      elRef.current = null;
    };
  }, [level, containerId]);

  // Scroll lock
  useEffect(() => {
    if (!lockScroll) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [lockScroll]);

  if (!mounted || !elRef.current) return null;

  return createPortal(children, elRef.current);
};

AICPortal.displayName = "AICPortal";
