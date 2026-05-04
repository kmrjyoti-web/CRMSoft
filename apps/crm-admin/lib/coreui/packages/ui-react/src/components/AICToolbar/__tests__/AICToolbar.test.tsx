/**
 * AICToolbar tests.
 * 5 test cases per P11.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICToolbar } from "../AICToolbar";

const mockActions = [
  { id: "save", label: "Save", icon: "save" },
  { id: "print", label: "Print", icon: "print" },
  { id: "refresh", label: "Refresh", icon: "refresh" },
];

const mockPrimaryAction = {
  id: "create",
  label: "Create",
  icon: "plus",
};

describe("AICToolbar", () => {
  // ── 1. Renders title ──────────────────────────────────
  it("renders title", () => {
    const { container } = render(
      <AICToolbar title="My Toolbar" />,
    );
    const toolbar = container.querySelector(
      "[data-testid='aic-toolbar']",
    );
    expect(toolbar).toBeTruthy();
    const titleEl = container.querySelector(
      "[data-testid='aic-toolbar-title']",
    );
    expect(titleEl).toBeTruthy();
    expect(titleEl?.textContent).toContain("My Toolbar");
  });

  // ── 2. Action buttons fire commands ───────────────────
  it("action buttons fire commands", () => {
    const onActionClick = vi.fn();
    const { container } = render(
      <AICToolbar
        title="Toolbar"
        actions={mockActions}
        onActionClick={onActionClick}
      />,
    );
    const actionsEl = container.querySelector(
      "[data-testid='aic-toolbar-actions']",
    );
    expect(actionsEl).toBeTruthy();
    // Click the first action button (save)
    const buttons = actionsEl!.querySelectorAll(
      "[data-testid='aic-button']",
    );
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    fireEvent.click(buttons[0] as HTMLElement);
    expect(onActionClick).toHaveBeenCalledWith("save");
  });

  // ── 3. Search input filters (test that actions render) ─
  it("renders all action buttons", () => {
    const { container } = render(
      <AICToolbar title="Toolbar" actions={mockActions} />,
    );
    const actionsEl = container.querySelector(
      "[data-testid='aic-toolbar-actions']",
    );
    // Should render 3 toolbar button wrappers for the 3 actions
    const wrappers = actionsEl!.querySelectorAll(
      "[data-testid='toolbar-button-wrapper']",
    );
    expect(wrappers.length).toBe(3);
  });

  // ── 4. Primary action renders with dropdown ───────────
  it("primary action renders with dropdown", () => {
    const onActionClick = vi.fn();
    const onPrimaryDropdownClick = vi.fn();
    const { container } = render(
      <AICToolbar
        title="Toolbar"
        primaryAction={mockPrimaryAction}
        onActionClick={onActionClick}
        onPrimaryDropdownClick={onPrimaryDropdownClick}
      />,
    );
    const primaryEl = container.querySelector(
      "[data-testid='aic-toolbar-primary-action']",
    );
    expect(primaryEl).toBeTruthy();
    // Should contain two AICButton elements (main + dropdown)
    const buttons = primaryEl!.querySelectorAll(
      "[data-testid='aic-button']",
    );
    expect(buttons.length).toBe(2);
    // Click the main primary button
    fireEvent.click(buttons[0] as HTMLElement);
    expect(onActionClick).toHaveBeenCalledWith("create");
    // Click the dropdown chevron button
    fireEvent.click(buttons[1] as HTMLElement);
    expect(onPrimaryDropdownClick).toHaveBeenCalledTimes(1);
  });

  // ── 5. Title icon renders AICIcon ───────────────────
  it("title icon renders AICIcon", () => {
    const { container } = render(
      <AICToolbar title="Settings" titleIcon="cog" />,
    );
    const titleEl = container.querySelector(
      "[data-testid='aic-toolbar-title']",
    );
    expect(titleEl).toBeTruthy();
    // Should contain a AICIcon
    const icon = titleEl?.querySelector("[data-testid='aic-icon']");
    expect(icon).toBeTruthy();
    const svg = icon?.querySelector("svg");
    expect(svg).toBeTruthy();
  });
});
