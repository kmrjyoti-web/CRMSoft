// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, fireEvent, act } from "@testing-library/react";

// Hooks
import { useLayout } from "../shared/hooks/useLayout";
import { usePageLayout } from "../shared/hooks/usePageLayout";
import { useTravelLayout } from "../presets/travel/hooks/useTravelLayout";
import { useTravelTheme } from "../presets/travel/hooks/useTravelTheme";
import { useTravelShortcut } from "../presets/travel/hooks/useTravelShortcut";

// Components
import { TravelLayout } from "../presets/travel/react/TravelLayout";
import { TravelFooter } from "../presets/travel/react/TravelFooter";
import { TravelShortcuts } from "../presets/travel/react/TravelShortcuts";

// Config
import {
  DEFAULT_TRAVEL_THEME,
  TRAVEL_THEME_PRESETS,
  TRAVEL_COMMON_KEYS,
  TRAVEL_NAVIGATION_KEYS,
  TRAVEL_BOOKING_KEYS,
  TRAVEL_INVOICE_KEYS,
} from "../presets/travel/core/travel.config";

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
  useTravelTheme.setState({ theme: { ...DEFAULT_TRAVEL_THEME } });
  useTravelShortcut.setState({ globalShortcuts: [], pageShortcuts: [] });
});

// ═══════════════════════════════════════════════════════════
// 1. TravelLayout renders sidebar with glassmorphism
// ═══════════════════════════════════════════════════════════

describe("TravelLayout", () => {
  it("renders sidebar when menuPosition='vertical'", () => {
    useLayout.setState({ menuPosition: "vertical" });
    const { container } = render(<TravelLayout>content</TravelLayout>);

    const sidebar = container.querySelector(".sidebar-area");
    expect(sidebar).not.toBeNull();

    const glassWrapper = container.querySelector(".travel-sidebar-wrapper");
    expect(glassWrapper).not.toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  // 2. TravelLayout renders mesh gradient layer
  // ═══════════════════════════════════════════════════════════

  it("renders mesh gradient layer when meshEnabled is true", () => {
    useTravelTheme.setState({
      theme: { ...DEFAULT_TRAVEL_THEME, meshEnabled: true },
    });
    const { container } = render(<TravelLayout>content</TravelLayout>);

    const mesh = container.querySelector(".travel-mesh-gradient");
    expect(mesh).not.toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  // 3. TravelLayout hides mesh gradient when disabled
  // ═══════════════════════════════════════════════════════════

  it("does not render mesh gradient when meshEnabled is false", () => {
    useTravelTheme.setState({
      theme: { ...DEFAULT_TRAVEL_THEME, meshEnabled: false },
    });
    const { container } = render(<TravelLayout>content</TravelLayout>);

    const mesh = container.querySelector(".travel-mesh-gradient");
    expect(mesh).toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  // 4. TravelLayout renders horizontal menu when menuPosition='horizontal'
  // ═══════════════════════════════════════════════════════════

  it("renders horizontal menu when menuPosition='horizontal'", () => {
    useLayout.setState({ menuPosition: "horizontal" });
    useTravelTheme.setState({
      theme: { ...DEFAULT_TRAVEL_THEME, menuPosition: "horizontal" },
    });

    const { container } = render(<TravelLayout>content</TravelLayout>);

    const wrapper = container.querySelector(".travel-layout-wrapper");
    expect(wrapper?.className).toContain("horizontal-layout");

    const sidebar = container.querySelector(".sidebar-area");
    expect(sidebar).toBeNull();

    const horizontalMenu = container.querySelector(".horizontal-menu-area");
    expect(horizontalMenu).not.toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  // 5. Clicking backdrop toggles sidebar
  // ═══════════════════════════════════════════════════════════

  it("clicking backdrop toggles sidebar", () => {
    useLayout.setState({ isSidebarClosed: false, menuPosition: "vertical" });
    const { container } = render(<TravelLayout>content</TravelLayout>);

    const backdrop = container.querySelector(".mobile-sidebar-backdrop");
    expect(backdrop).not.toBeNull();

    fireEvent.click(backdrop!);
    expect(useLayout.getState().isSidebarClosed).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// 6. Applying color preset changes theme state
// ═══════════════════════════════════════════════════════════

describe("useTravelTheme", () => {
  it("applying a preset updates theme state", () => {
    const ocean = TRAVEL_THEME_PRESETS.find((p) => p.name === "Ocean")!;
    act(() => useTravelTheme.getState().applyPreset(ocean));

    const theme = useTravelTheme.getState().theme;
    expect(theme.accent).toBe("#0284c7");
    expect(theme.meshColor1).toBe("#38bdf8");
    expect(theme.meshColor2).toBe("#0ea5e9");
  });
});

// ═══════════════════════════════════════════════════════════
// 7. Ctrl+Shift+K opens shortcut modal
// ═══════════════════════════════════════════════════════════

describe("Keyboard shortcuts", () => {
  it("Ctrl+Shift+K toggles shortcut modal", () => {
    const { container } = render(<TravelLayout>content</TravelLayout>);

    // Initially no modal
    expect(container.querySelector(".travel-shortcut-overlay")).toBeNull();

    // Fire Ctrl+Shift+K
    fireEvent.keyDown(window, {
      key: "k",
      ctrlKey: true,
      shiftKey: true,
    });

    // Modal should appear
    expect(container.querySelector(".travel-shortcut-overlay")).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════
// 8. Shortcut modal lists all registered shortcuts
// ═══════════════════════════════════════════════════════════

describe("TravelShortcuts", () => {
  it("lists all shortcut keys", () => {
    const onClose = vi.fn();
    const { container } = render(<TravelShortcuts onClose={onClose} />);

    const rows = container.querySelectorAll(".shortcut-row");
    // TRAVEL_COMMON_KEYS (10) + NAVIGATION (3) + BOOKING (5) + INVOICE (6) = 24
    expect(rows.length).toBe(
      TRAVEL_COMMON_KEYS.length +
        TRAVEL_NAVIGATION_KEYS.length +
        TRAVEL_BOOKING_KEYS.length +
        TRAVEL_INVOICE_KEYS.length,
    );
  });
});

// ═══════════════════════════════════════════════════════════
// 9. Menu item toggleItem expands/collapses
// ═══════════════════════════════════════════════════════════

describe("useTravelLayout", () => {
  it("toggleItem expands/collapses menu items with children", () => {
    const items = useTravelLayout.getState().menuItems;
    const bookings = items.find((i) => i.label === "Bookings");
    expect(bookings).toBeDefined();
    expect(bookings!.expanded).toBe(false);

    act(() => useTravelLayout.getState().toggleItem(bookings!));
    const updated = useTravelLayout.getState().menuItems.find(
      (i) => i.label === "Bookings",
    );
    expect(updated!.expanded).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// 10. Footer renders with TravelDesk branding
// ═══════════════════════════════════════════════════════════

describe("TravelFooter", () => {
  it("renders with TravelDesk branding", () => {
    const { container } = render(<TravelFooter />);
    const footer = container.querySelector(".travel-footer");
    expect(footer).not.toBeNull();
    expect(footer?.textContent).toContain("TravelDesk");
  });
});
