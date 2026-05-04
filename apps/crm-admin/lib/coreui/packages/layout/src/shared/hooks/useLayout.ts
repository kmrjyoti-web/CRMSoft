// Source: Angular utils/layout.service.ts
import { create } from "zustand";
import type { MargLayoutConfig } from "../../presets/marg/core/marg.types";

const DEFAULT_LAYOUT_CONFIG: MargLayoutConfig = {
  settings: {
    sidebar_type: "compact-wrapper",
    sidebar_setting: "default-sidebar",
    layout_type: "ltr",
    sidebar_backround: "dark-sidebar",
    selected_layout: "marg",
  },
  color: {
    primary_color: "#7366ff",
    secondary_color: "#f73164",
  },
};

interface LayoutStore {
  config: MargLayoutConfig;
  isSidebarClosed: boolean;
  isSearchOpen: boolean;
  menuPosition: "vertical" | "horizontal";

  updateConfig: (newConfig: Partial<MargLayoutConfig>) => void;
  toggleSidebar: () => void;
  setSidebarClosed: (closed: boolean) => void;
  setMenuPosition: (position: "vertical" | "horizontal") => void;
  setSearchOpen: (open: boolean) => void;
  setSidebarType: (type: string) => void;
  setColor: (primary: string, secondary: string) => void;
}

export const useLayout = create<LayoutStore>((set) => ({
  config: DEFAULT_LAYOUT_CONFIG,
  isSidebarClosed: false,
  isSearchOpen: false,
  menuPosition: "vertical",

  updateConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),

  toggleSidebar: () =>
    set((state) => ({ isSidebarClosed: !state.isSidebarClosed })),

  setSidebarClosed: (closed) => set({ isSidebarClosed: closed }),

  setMenuPosition: (position) => set({ menuPosition: position }),

  setSearchOpen: (open) => set({ isSearchOpen: open }),

  setSidebarType: (type) =>
    set((state) => ({
      config: {
        ...state.config,
        settings: { ...state.config.settings, sidebar_type: type },
      },
    })),

  setColor: (primary, secondary) =>
    set((state) => ({
      config: {
        ...state.config,
        color: { primary_color: primary, secondary_color: secondary },
      },
    })),
}));
