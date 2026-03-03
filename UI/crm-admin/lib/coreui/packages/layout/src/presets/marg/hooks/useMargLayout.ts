// Source: Angular services/marg-layout.service.ts
import { create } from "zustand";
import type { MenuItem } from "../core/marg.types";
import { DEFAULT_MARG_MENU_ITEMS } from "../core/marg.config";

interface MargLayoutStore {
  menuItems: MenuItem[];
  initialized: boolean;

  init: () => void;
  getMenuItems: () => MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  toggleItem: (item: MenuItem) => void;
  setActiveItem: (link: string) => void;
  filterMenuItems: (term: string) => MenuItem[];
}

export const useMargLayout = create<MargLayoutStore>((set, get) => ({
  menuItems: DEFAULT_MARG_MENU_ITEMS.map((item) => ({ ...item })),
  initialized: false,

  init: () => {
    if (get().initialized) return;
    set({ initialized: true });
  },

  getMenuItems: () => get().menuItems,

  setMenuItems: (items) => set({ menuItems: items }),

  toggleItem: (item) =>
    set((state) => ({
      menuItems: state.menuItems.map((m) =>
        m === item || m.label === item.label
          ? { ...m, expanded: !m.expanded }
          : m,
      ),
    })),

  setActiveItem: (link) =>
    set((state) => ({
      menuItems: state.menuItems.map((m) => ({
        ...m,
        active: m.link === link,
        subItems: m.subItems?.map((s) => ({
          ...s,
          active: s.link === link,
          subItems: s.subItems?.map((c) => ({
            ...c,
            active: c.link === link,
          })),
        })),
      })),
    })),

  filterMenuItems: (term: string): MenuItem[] => {
    const items = get().menuItems;
    if (!term) return items;
    const lowerTerm = term.toLowerCase();

    const result: MenuItem[] = [];
    for (const item of items) {
      const matchesSelf = item.label.toLowerCase().includes(lowerTerm);
      const matchingSubItems =
        item.subItems?.filter((sub) =>
          sub.label.toLowerCase().includes(lowerTerm),
        ) ?? [];

      if (matchesSelf || matchingSubItems.length > 0) {
        result.push({
          ...item,
          expanded: matchingSubItems.length > 0 || !!item.expanded,
          subItems:
            matchingSubItems.length > 0
              ? matchingSubItems
              : item.subItems,
        });
      }
    }
    return result;
  },
}));
