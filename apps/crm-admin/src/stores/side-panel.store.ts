import type { ReactNode } from "react";

import { create } from "zustand";

// ── Types ──────────────────────────────────────────────

export type PanelState = "normal" | "minimized" | "maximized" | "fullscreen";

export interface ActionButton {
  id: string;
  label: string;
  icon?: string;
  showAs: "icon" | "text" | "both";
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

export interface PanelConfig {
  id: string;
  title: string;
  content: ReactNode;
  icon?: string;
  width?: number;
  noPadding?: boolean;
  newTabUrl?: string;
  headerButtons?: ActionButton[];
  footerButtons?: ActionButton[];
  footerLeft?: ReactNode;
  onClose?: () => void;
  /** Return false to block close (e.g. unsaved changes guard). */
  onBeforeClose?: () => boolean;
}

export interface PanelInstance {
  config: PanelConfig;
  state: PanelState;
  zIndex: number;
  openedAt: number;
}

// ── Store ──────────────────────────────────────────────

interface SidePanelStore {
  panels: Record<string, PanelInstance>;
  nextZIndex: number;

  openPanel: (config: PanelConfig) => void;
  closePanel: (id: string) => void;
  closeAllPanels: () => void;
  setPanelState: (id: string, state: PanelState) => void;
  bringToFront: (id: string) => void;
  updatePanelConfig: (id: string, partial: Partial<PanelConfig>) => void;
}

export const useSidePanelStore = create<SidePanelStore>()((set, get) => ({
  panels: {},
  nextZIndex: 1000,

  openPanel: (config) => {
    const { panels, nextZIndex } = get();
    if (panels[config.id]) {
      set((s) => ({
        panels: {
          ...s.panels,
          [config.id]: {
            ...s.panels[config.id],
            config,
            state: "normal",
            zIndex: s.nextZIndex,
          },
        },
        nextZIndex: s.nextZIndex + 1,
      }));
      return;
    }
    set({
      panels: {
        ...panels,
        [config.id]: {
          config,
          state: "normal",
          zIndex: nextZIndex,
          openedAt: Date.now(),
        },
      },
      nextZIndex: nextZIndex + 1,
    });
  },

  closePanel: (id) => {
    const panel = get().panels[id];
    if (!panel) return;
    if (panel.config.onBeforeClose && panel.config.onBeforeClose() === false) return;
    panel.config.onClose?.();
    set((s) => {
      const rest = { ...s.panels };
      delete rest[id];
      return { panels: rest };
    });
  },

  closeAllPanels: () => {
    Object.values(get().panels).forEach((p) => p.config.onClose?.());
    set({ panels: {}, nextZIndex: 1000 });
  },

  setPanelState: (id, state) =>
    set((s) =>
      s.panels[id]
        ? {
            panels: {
              ...s.panels,
              [id]: {
                ...s.panels[id],
                state,
                zIndex: state === "minimized" ? s.panels[id].zIndex : s.nextZIndex,
              },
            },
            nextZIndex: state === "minimized" ? s.nextZIndex : s.nextZIndex + 1,
          }
        : s,
    ),

  bringToFront: (id) =>
    set((s) =>
      s.panels[id]
        ? {
            panels: { ...s.panels, [id]: { ...s.panels[id], zIndex: s.nextZIndex } },
            nextZIndex: s.nextZIndex + 1,
          }
        : s,
    ),

  updatePanelConfig: (id, partial) =>
    set((s) =>
      s.panels[id]
        ? {
            panels: {
              ...s.panels,
              [id]: { ...s.panels[id], config: { ...s.panels[id].config, ...partial } },
            },
          }
        : s,
    ),
}));
