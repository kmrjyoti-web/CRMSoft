/**
 * AICToolbarButton tests.
 * 5 test cases per P11.2 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICToolbarButton } from "../AICToolbarButton";

describe("AICToolbarButton", () => {
  // ── 1. Renders icon ───────────────────────────────────
  it("renders icon", () => {
    const { container } = render(
      <AICToolbarButton iconName="search" label="Search" />,
    );
    const wrapper = container.querySelector(
      "[data-testid='toolbar-button-wrapper']",
    );
    expect(wrapper).toBeTruthy();
    // Should contain a AICIcon rendering the search SVG
    const icon = wrapper?.querySelector("[data-testid='aic-icon']");
    expect(icon).toBeTruthy();
    const svg = icon?.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  // ── 2. AICTooltip/title appears for label ────────────────
  it("tooltip/title appears for label", () => {
    const { container } = render(
      <AICToolbarButton iconName="search" label="Search" />,
    );
    const btn = container.querySelector(
      "[data-testid='aic-button']",
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("title")).toBe("Search");
  });

  // ── 3. AICBadge/shortcut shows ───────────────────────────
  it("badge/shortcut shows", () => {
    const { container } = render(
      <AICToolbarButton iconName="search" label="Search" shortcut="Ctrl+F" />,
    );
    const shortcut = container.querySelector(
      "[data-testid='aic-button-shortcut']",
    );
    expect(shortcut).toBeTruthy();
    expect(shortcut?.textContent).toBe("Ctrl+F");
  });

  // ── 4. Click fires action ─────────────────────────────
  it("click fires action", () => {
    const onClick = vi.fn();
    const { container } = render(
      <AICToolbarButton iconName="search" label="Search" onClick={onClick} />,
    );
    const btn = container.querySelector(
      "[data-testid='aic-button']",
    ) as HTMLButtonElement;
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ── 5. Active state shows pressed style ───────────────
  it("active state shows pressed style", () => {
    const { container } = render(
      <AICToolbarButton iconName="bold" label="Bold" active />,
    );
    const btn = container.querySelector(
      "[data-testid='aic-button']",
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    // Active state should apply ring and bg-slate-100 classes
    expect(btn.className).toContain("ring-2");
    expect(btn.className).toContain("bg-slate-100");
  });
});
