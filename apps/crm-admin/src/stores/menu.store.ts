import { create } from "zustand";

import type { MenuTreeItem } from "@/types/menu";

// ── Menu Store ─────────────────────────────────────────

export interface MenuState {
  rawMenu: MenuTreeItem[];
  loaded: boolean;
  loading: boolean;

  setLoading: () => void;
  setMenu: (items: MenuTreeItem[]) => void;
  setError: () => void;
  reset: () => void;
}

export const useMenuStore = create<MenuState>()((set) => ({
  rawMenu: [],
  loaded: false,
  loading: false,

  setLoading: () => set({ loading: true, loaded: false }),
  setMenu: (items) => set({ rawMenu: items, loaded: true, loading: false }),
  setError: () => set({ loaded: true, loading: false }),
  reset: () => set({ rawMenu: [], loaded: false, loading: false }),
}));
