import type { MenuTreeItem } from "@/types/menu";

import { useMenuStore } from "../menu.store";

// ── Setup ────────────────────────────────────────────────

beforeEach(() => {
  useMenuStore.getState().reset();
});

// ── Fixtures ────────────────────────────────────────────

const fakeMenu: MenuTreeItem[] = [
  {
    id: "1",
    name: "Leads",
    code: "leads",
    icon: "icon-leads",
    route: "/leads",
    menuType: "item",
    children: [
      {
        id: "1-1",
        name: "All Leads",
        code: "all-leads",
        icon: "icon-list",
        route: "/leads/all",
        menuType: "item",
      },
    ],
  },
];

// ── Tests ────────────────────────────────────────────────

describe("menu.store setMenu", () => {
  it("stores the raw menu tree and marks loaded", () => {
    useMenuStore.getState().setMenu(fakeMenu);

    const state = useMenuStore.getState();
    expect(state.rawMenu).toEqual(fakeMenu);
    expect(state.loaded).toBe(true);
  });
});

describe("menu.store reset", () => {
  it("clears menu and resets loaded flag", () => {
    useMenuStore.getState().setMenu(fakeMenu);
    useMenuStore.getState().reset();

    const state = useMenuStore.getState();
    expect(state.rawMenu).toEqual([]);
    expect(state.loaded).toBe(false);
  });
});
