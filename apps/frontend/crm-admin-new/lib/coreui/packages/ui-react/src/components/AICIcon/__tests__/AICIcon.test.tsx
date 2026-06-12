/**
 * AICIcon tests.
 * 6 test cases per P11.4 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICIcon } from "../AICIcon";

describe("AICIcon", () => {
  // ── 1. Renders correct SVG for name='search' ──────────
  it("renders correct SVG for name='search'", () => {
    const { container } = render(<AICIcon name="search" />);
    const icon = container.querySelector(
      "[data-testid='aic-icon']",
    ) as HTMLElement;
    expect(icon).toBeTruthy();
    // The search icon SVG should contain an svg element
    const svg = icon.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  // ── 2. Size 'lg' applies 1.25rem ──────────────────────
  it("size 'lg' applies 1.25rem", () => {
    const { container } = render(<AICIcon name="search" size="lg" />);
    const icon = container.querySelector(
      "[data-testid='aic-icon']",
    ) as HTMLElement;
    expect(icon).toBeTruthy();
    expect(icon.style.width).toBe("1.25rem");
    expect(icon.style.height).toBe("1.25rem");
  });

  // ── 3. Color prop changes style color ─────────────────
  it("color prop changes style color", () => {
    const { container } = render(
      <AICIcon name="search" color="red" />,
    );
    const icon = container.querySelector(
      "[data-testid='aic-icon']",
    ) as HTMLElement;
    expect(icon).toBeTruthy();
    expect(icon.style.color).toBe("red");
  });

  // ── 4. Custom SVG string renders ──────────────────────
  it("custom SVG string renders", () => {
    const customSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="blue" /></svg>';
    const { container } = render(<AICIcon svgContent={customSvg} />);
    const icon = container.querySelector(
      "[data-testid='aic-icon']",
    ) as HTMLElement;
    expect(icon).toBeTruthy();
    const svg = icon.querySelector("svg");
    expect(svg).toBeTruthy();
    // fill="blue" should be replaced with fill="currentColor"
    const circle = icon.querySelector("circle");
    expect(circle?.getAttribute("fill")).toBe("currentColor");
  });

  // ── 5. Spin animation applies CSS class ───────────────
  it("spin animation applies CSS class", () => {
    const { container } = render(<AICIcon name="search" spin />);
    const icon = container.querySelector(
      "[data-testid='aic-icon']",
    ) as HTMLElement;
    expect(icon).toBeTruthy();
    expect(icon.className).toContain("animate-spin");
  });

  // ── 6. Unknown icon name renders nothing (no crash) ───
  it("unknown icon name renders nothing (no crash)", () => {
    const { container } = render(
      <AICIcon name="nonexistent-icon-xyz" />,
    );
    const icon = container.querySelector("[data-testid='aic-icon']");
    expect(icon).toBeNull();
  });
});
