import { create } from "zustand";

import type { MenuTreeItem } from "@/types/menu";

// ── Menu Store ─────────────────────────────────────────

export interface MenuState {
  rawMenu: MenuTreeItem[];
  loaded: boolean;

  setMenu: (items: MenuTreeItem[]) => void;
  reset: () => void;
}

export const useMenuStore = create<MenuState>()((set) => ({
  rawMenu: [],
  loaded: false,

  setMenu: (items) => set({ rawMenu: items, loaded: true }),
  reset: () => set({ rawMenu: [], loaded: false }),
}));
