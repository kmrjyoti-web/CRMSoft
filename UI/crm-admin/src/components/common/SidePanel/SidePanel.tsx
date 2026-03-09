"use client";

import { useEffect, useRef, useCallback } from "react";

import { createPortal } from "react-dom";

import { useSidePanelStore } from "@/stores/side-panel.store";

import type { PanelInstance } from "@/stores/side-panel.store";

import { SidePanelHeader } from "./SidePanelHeader";
import { SidePanelFooter } from "./SidePanelFooter";

interface SidePanelProps {
  panel: PanelInstance;
}

export function SidePanel({ panel }: SidePanelProps) {
  const { config, state, zIndex } = panel;
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const setPanelState = useSidePanelStore((s) => s.setPanelState);
  const closePanel = useSidePanelStore((s) => s.closePanel);
  const bringToFront = useSidePanelStore((s) => s.bringToFront);

  const isFullscreen = state === "fullscreen";
  const isMaximized = state === "maximized";

  // Bring to front on mousedown (fires before click, so child panels opened via
  // button click handlers always get a higher z-index than the parent)
  const handlePanelMouseDown = useCallback(() => {
    bringToFront(config.id);
  }, [bringToFront, config.id]);

  // Escape key closes topmost panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const panels = useSidePanelStore.getState().panels;
      const openPanels = Object.values(panels).filter((p) => p.state !== "minimized");
      if (openPanels.length === 0) return;
      const topPanel = openPanels.reduce((top, p) => (p.zIndex > top.zIndex ? p : top));
      if (topPanel.config.id === config.id) {
        closePanel(config.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [config.id, closePanel]);

  // Slide-in animation on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  // Don't render if minimized
  if (state === "minimized") return null;

  const hasCustomWidth = !isFullscreen && !isMaximized && config.width;
  const widthClass = isFullscreen
    ? "sp-panel--fullscreen"
    : isMaximized
      ? "sp-panel--maximized"
      : hasCustomWidth
        ? "sp-panel--normal"
        : "sp-panel--normal";

  const positionClass = isFullscreen ? "sp-panel--inset" : "";
  const animClass = isFirstRender.current ? " sp-panel--entering" : "";
  const bodyClass = config.noPadding ? "sp-body sp-body--no-pad" : "sp-body";

  const panelEl = (
    <div
      ref={panelRef}
      className={`sp-panel ${widthClass} ${positionClass}${animClass}`}
      style={{ zIndex, ...(hasCustomWidth ? { width: config.width } : {}) }}
      onMouseDown={handlePanelMouseDown}
    >
      <SidePanelHeader
        config={config}
        state={state}
        onMinimize={() => setPanelState(config.id, "minimized")}
        onMaximize={() => setPanelState(config.id, isMaximized ? "normal" : "maximized")}
        onFullScreen={() => setPanelState(config.id, isFullscreen ? "normal" : "fullscreen")}
        onRestore={() => setPanelState(config.id, "normal")}
        onClose={() => closePanel(config.id)}
      />

      <div className={bodyClass}>{config.content}</div>

      <SidePanelFooter
        buttons={config.footerButtons}
        onClose={() => closePanel(config.id)}
      />
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(panelEl, document.body);
}
