/**
 * AICToolbarButtonGroup tests.
 * 3 test cases per P11.3 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICToolbarButtonGroup } from "../AICToolbarButtonGroup";

const mockButtons = [
  { id: "bold", label: "Bold", iconName: "bold" },
  { id: "italic", label: "Italic", iconName: "italic" },
  { id: "underline", label: "Underline", iconName: "underline" },
];

describe("AICToolbarButtonGroup", () => {
  // ── 1. Renders group of buttons ───────────────────────
  it("renders group of buttons", () => {
    const { container } = render(
      <AICToolbarButtonGroup buttons={mockButtons} />,
    );
    const group = container.querySelector(
      "[data-testid='toolbar-button-group']",
    );
    expect(group).toBeTruthy();
    // Should render 3 toolbar button wrappers
    const wrappers = container.querySelectorAll(
      "[data-testid='toolbar-button-wrapper']",
    );
    expect(wrappers.length).toBe(3);
  });

  // ── 2. Active button shows pressed state ──────────────
  it("active button shows pressed state", () => {
    const { container } = render(
      <AICToolbarButtonGroup buttons={mockButtons} activeId="bold" />,
    );
    const buttons = container.querySelectorAll(
      "[data-testid='aic-button']",
    );
    // The first button (bold) should have active styling
    expect(buttons[0]?.className).toContain("ring-2");
    expect(buttons[0]?.className).toContain("bg-slate-100");
    // Other buttons should NOT have active styling
    expect(buttons[1]?.className).not.toContain("bg-slate-100");
  });

  // ── 3. AICButton click fires with correct ID ────────────
  it("button click fires with correct ID", () => {
    const onButtonClick = vi.fn();
    const { container } = render(
      <AICToolbarButtonGroup
        buttons={mockButtons}
        onButtonClick={onButtonClick}
      />,
    );
    const buttons = container.querySelectorAll(
      "[data-testid='aic-button']",
    );
    // Click the second button (italic)
    fireEvent.click(buttons[1] as HTMLElement);
    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(onButtonClick).toHaveBeenCalledWith("italic");
  });
});
