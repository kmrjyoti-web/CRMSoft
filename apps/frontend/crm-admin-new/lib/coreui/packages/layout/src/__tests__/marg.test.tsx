// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, fireEvent, act } from "@testing-library/react";

// Hooks
import { useLayout } from "../shared/hooks/useLayout";
import { usePageLayout } from "../shared/hooks/usePageLayout";
import { useMargLayout } from "../presets/marg/hooks/useMargLayout";
import { useMargTheme } from "../presets/marg/hooks/useMargTheme";
import { useMargShortcut } from "../presets/marg/hooks/useMargShortcut";

// Components
import { MargLayout } from "../presets/marg/react/MargLayout";
import { MargFooter } from "../presets/marg/react/MargFooter";
import { MargShortcuts } from "../presets/marg/react/MargShortcuts";

// Config
import {
  DEFAULT_MARG_THEME,
  MARG_THEME_PRESETS,
  MARG_COMMON_KEYS,
} from "../presets/marg/core/marg.config";

// Reset all Zustand stores between tests
beforeEach(() => {
  useLayout.setState({
    isSidebarClosed: false,
    isSearchOpen: false,
    menuPosition: "vertical",
  });
  usePageLayout.setState({
    showMainHeader: true,
    showMainSidebar: true,
    showMainFooter: true,
  });
  useMargTheme.setState({ theme: { ...DEFAULT_MARG_THEME } });
  useMargShortcut.setState({ globalShortcuts: [], pageShortcuts: [] });
});

// ═══════════════════════════════════════════════════════════
// 1. MargLayout renders sidebar when menuPosition='vertical'
// ═══════════════════════════════════════════════════════════

describe("MargLayout", () => {
  it("renders sidebar when menuPosition='vertical'", () => {
    useLayout.setState({ menuPosition: "vertical" });
    const { container } = render(<MargLayout>content</MargLayout>);

    const sidebar = container.querySelector(".sidebar-area");
    expect(sidebar).not.toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  // 2. MargLayout renders horizontal menu when menuPosition='horizontal'
  // ═══════════════════════════════════════════════════════════

  it("renders horizontal menu when menuPosition='horizontal'", () => {
    useLayout.setState({ menuPosition: "horizontal" });
    useMargTheme.setState({
      theme: { ...DEFAULT_MARG_THEME, menuPosition: "horizontal" },
    });

    const { container } = render(<MargLayout>content</MargLayout>);

    const wrapper = container.querySelector(".marg-layout-wrapper");
    expect(wrapper?.className).toContain("horizontal-layout");

    const sidebar = container.querySelector(".sidebar-area");
    expect(sidebar).toBeNull();

    const horizontalMenu = container.querySelector(".horizontal-menu-area");
    expect(horizontalMenu).not.toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  // 3. Mobile backdrop appears when sidebar open on mobile viewport
  // ═══════════════════════════════════════════════════════════

  it("shows mobile backdrop when sidebar is open and vertical", () => {
    useLayout.setState({ isSidebarClosed: false, menuPosition: "vertical" });
    const { container } = render(<MargLayout>content</MargLayout>);

    const backdrop = container.querySelector(".mobile-sidebar-backdrop");
    expect(backdrop).not.toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  // 4. Clicking backdrop closes sidebar
  // ═══════════════════════════════════════════════════════════

  it("clicking backdrop toggles sidebar", () => {
    useLayout.setState({ isSidebarClosed: false, menuPosition: "vertical" });
    const { container } = render(<MargLayout>content</MargLayout>);

    const backdrop = container.querySelector(".mobile-sidebar-backdrop");
    expect(backdrop).not.toBeNull();

    fireEvent.click(backdrop!);
    // After click, isSidebarClosed should be true
    expect(useLayout.getState().isSidebarClosed).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════
  // 11. Footer renders full-width below content
  // ═══════════════════════════════════════════════════════════

  it("renders footer full-width below content", () => {
    const { container } = render(<MargLayout>content</MargLayout>);

    const footer = container.querySelector(".footer-area");
    expect(footer).not.toBeNull();

    const margFooter = container.querySelector(".marg-footer");
    expect(margFooter).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════
// 5. toggleSidebar toggles sidebarOpen state
// ═══════════════════════════════════════════════════════════

describe("useLayout", () => {
  it("toggleSidebar toggles isSidebarClosed state", () => {
    expect(useLayout.getState().isSidebarClosed).toBe(false);
    act(() => useLayout.getState().toggleSidebar());
    expect(useLayout.getState().isSidebarClosed).toBe(true);
    act(() => useLayout.getState().toggleSidebar());
    expect(useLayout.getState().isSidebarClosed).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// 6. Sidebar collapse mode shows icons only
// ═══════════════════════════════════════════════════════════

describe("MargSidebar collapsed", () => {
  it("sidebar wrapper has collapsed class when sidebar is closed", () => {
    useLayout.setState({ isSidebarClosed: true });
    const { container } = render(<MargLayout>content</MargLayout>);

    const sidebarArea = container.querySelector(".sidebar-area");
    expect(sidebarArea?.className).toContain("collapsed");
  });
});

// ═══════════════════════════════════════════════════════════
// 7. Theme customizer opens as drawer
// ═══════════════════════════════════════════════════════════

describe("MargThemeCustomizer", () => {
  it("customizer panel opens when toggle is clicked", () => {
    const { container } = render(<MargLayout>content</MargLayout>);

    const toggle = container.querySelector(".customizer-toggle");
    expect(toggle).not.toBeNull();

    const panelBefore = container.querySelector(".customizer-panel");
    expect(panelBefore?.className).not.toContain("open");

    fireEvent.click(toggle!);

    const panelAfter = container.querySelector(".customizer-panel");
    expect(panelAfter?.className).toContain("open");
  });
});

// ═══════════════════════════════════════════════════════════
// 8. Applying color preset changes CSS variables
// ═══════════════════════════════════════════════════════════

describe("useMargTheme", () => {
  it("applying a preset updates theme state", () => {
    const midnight = MARG_THEME_PRESETS.find((p) => p.name === "Midnight")!;
    act(() => useMargTheme.getState().applyPreset(midnight));

    const theme = useMargTheme.getState().theme;
    expect(theme.headerBg).toBe("#1a237e");
    expect(theme.sidebarBg).toBe("#000051");
    expect(theme.accent).toBe("#534bae");
  });
});

// ═══════════════════════════════════════════════════════════
// 9. Keyboard shortcut Ctrl+Shift+K opens shortcut modal
// ═══════════════════════════════════════════════════════════

describe("Keyboard shortcuts", () => {
  it("Ctrl+Shift+K toggles shortcut modal", () => {
    const { container } = render(<MargLayout>content</MargLayout>);

    // Initially no modal
    expect(container.querySelector(".marg-shortcut-overlay")).toBeNull();

    // Fire Ctrl+Shift+K
    fireEvent.keyDown(window, {
      key: "k",
      ctrlKey: true,
      shiftKey: true,
    });

    // Modal should appear
    expect(container.querySelector(".marg-shortcut-overlay")).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════
// 10. Shortcut modal lists all registered shortcuts
// ═══════════════════════════════════════════════════════════

describe("MargShortcuts", () => {
  it("lists all common shortcut keys", () => {
    const onClose = vi.fn();
    const { container } = render(<MargShortcuts onClose={onClose} />);

    const rows = container.querySelectorAll(".shortcut-row");
    // MARG_COMMON_KEYS has 15 items, plus navigation (3), sale window (6), item list (7) = 31
    expect(rows.length).toBe(
      MARG_COMMON_KEYS.length + 3 + 6 + 7,
    );
  });
});

// ═══════════════════════════════════════════════════════════
// 12. Breadcrumb updates based on active route (via nav)
// ═══════════════════════════════════════════════════════════

describe("useNav", () => {
  it("setActive updates active state based on path", async () => {
    const { useNav } = await import("../shared/hooks/useNav");
    act(() => useNav.getState().setActive("/management/db"));

    const items = useNav.getState().items;
    const dbItem = items.find((i) => i.path === "/management/db");
    expect(dbItem?.active).toBe(true);

    const dashItem = items.find((i) => i.path === "/dashboard/default");
    expect(dashItem?.active).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// 13. Menu items with children expand/collapse on click
// ═══════════════════════════════════════════════════════════

describe("useMargLayout", () => {
  it("toggleItem expands/collapses menu items with children", () => {
    const items = useMargLayout.getState().menuItems;
    const logItem = items.find((i) => i.label === "Log");
    expect(logItem).toBeDefined();
    expect(logItem!.expanded).toBe(false);

    act(() => useMargLayout.getState().toggleItem(logItem!));
    const updated = useMargLayout.getState().menuItems.find(
      (i) => i.label === "Log",
    );
    expect(updated!.expanded).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// 14. Active menu item is highlighted
// ═══════════════════════════════════════════════════════════

describe("useMargLayout active item", () => {
  it("setActiveItem marks the correct item as active", () => {
    act(() =>
      useMargLayout
        .getState()
        .setActiveItem("/platform-console/ui-kit/selectors"),
    );

    const items = useMargLayout.getState().menuItems;
    const uikit = items.find((i) => i.label === "UIKit");
    const selectors = uikit?.subItems?.find((s) => s.label === "Selectors");
    expect(selectors?.active).toBe(true);

    // Previously active item should be deactivated
    const textInputs = uikit?.subItems?.find(
      (s) => s.label === "Text & Inputs",
    );
    expect(textInputs?.active).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// Footer component standalone test
// ═══════════════════════════════════════════════════════════

describe("MargFooter", () => {
  it("renders full-width with copyright text", () => {
    const { container } = render(<MargFooter />);
    const footer = container.querySelector(".marg-footer");
    expect(footer).not.toBeNull();
    expect(footer?.textContent).toContain("Marg ERP Ltd");
  });
});
