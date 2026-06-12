// Source: Angular services/nav.service.ts
import { create } from "zustand";
import type { NavMenu } from "../../presets/marg/core/marg.types";

const DEFAULT_NAV_ITEMS: NavMenu[] = [
  { headTitle1: "General" },
  {
    title: "Dashboard",
    icon: "home",
    type: "link",
    badgeType: "light-primary",
    badgeValue: "2",
    active: true,
    path: "/dashboard/default",
  },
  { headTitle1: "Management" },
  { title: "DB Management", icon: "database", type: "link", active: false, path: "/management/db" },
  { title: "API Management", icon: "server", type: "link", active: false, path: "/management/api" },
  { title: "Cache Management", icon: "hard-drive", type: "link", active: false, path: "/management/cache" },
  { headTitle1: "Platform" },
  {
    title: "Platform Console",
    icon: "command",
    type: "sub",
    active: false,
    children: [
      { title: "Studio", type: "link", path: "/platform-console/studio" },
      { title: "Ops", type: "link", path: "/platform-console/ops" },
      { title: "Designer", type: "link", path: "/platform-console/designer" },
      { title: "Product Management", type: "link", path: "/platform-console/product-management" },
      { title: "Sync Management", type: "link", path: "/platform-console/sync-management" },
      { title: "Developer Tools", type: "link", path: "/platform-console/dev-controls" },
      { title: "API Docs", type: "link", path: "/platform-console/help" },
    ],
  },
  { headTitle1: "Applications" },
  {
    title: "CRM",
    icon: "users",
    type: "sub",
    active: false,
    children: [
      { title: "Customer List", type: "link", active: false, path: "/customer-details" },
    ],
  },
  { title: "Settings", icon: "settings", type: "link", active: false, path: "/settings" },
];

interface NavStore {
  items: NavMenu[];
  setItems: (items: NavMenu[]) => void;
  setActive: (path: string) => void;
}

export const useNav = create<NavStore>((set) => ({
  items: DEFAULT_NAV_ITEMS,

  setItems: (items) => set({ items }),

  setActive: (path) =>
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        active: item.path === path,
        children: item.children?.map((child) => ({
          ...child,
          active: child.path === path,
        })),
      })),
    })),
}));
