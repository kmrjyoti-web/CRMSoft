/**
 * AICFieldset component tests.
 * 5 test cases per P5.3 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICFieldset } from "../AICFieldset";
import { getFieldsetContainerClass } from "@coreui/ui";

describe("AICFieldset", () => {
  // ── 1. Renders legend text ──────────────────────────────
  it("renders legend text", () => {
    const { container } = render(
      <AICFieldset label="Personal Info">
        <p>Content here</p>
      </AICFieldset>,
    );

    const legend = container.querySelector(
      "[data-testid='fieldset-legend']",
    );
    expect(legend).toBeTruthy();
    expect(legend?.textContent).toBe("Personal Info");
  });

  // ── 2. Collapse toggles children visibility ─────────────
  it("collapse toggles children visibility", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <AICFieldset label="Section" toggleable onToggle={onToggle}>
        <p data-testid="child-content">Visible content</p>
      </AICFieldset>,
    );

    // Content is visible initially
    expect(
      container.querySelector("[data-testid='child-content']"),
    ).toBeTruthy();

    // Click header to collapse
    const header = container.querySelector(
      "[data-testid='fieldset-header']",
    ) as HTMLElement;
    fireEvent.click(header);
    expect(onToggle).toHaveBeenCalledWith(true);

    // Content should be hidden
    expect(
      container.querySelector("[data-testid='child-content']"),
    ).toBeNull();

    // Click again to expand
    fireEvent.click(header);
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(
      container.querySelector("[data-testid='child-content']"),
    ).toBeTruthy();
  });

  // ── 3. Border variant applies ───────────────────────────
  it("border variant applies", () => {
    // Pure logic test
    const panelClass = getFieldsetContainerClass(
      "panel",
      "border border-gray-200 rounded-lg",
    );
    expect(panelClass).toBe("border border-gray-200 rounded-lg");

    const legendClass = getFieldsetContainerClass(
      "legend",
      "border border-gray-200 rounded-lg",
    );
    expect(legendClass).toContain("border border-gray-300");

    const { container } = render(
      <AICFieldset label="Panel" appearance="panel">
        <p>Panel content</p>
      </AICFieldset>,
    );

    const fieldset = container.querySelector(
      "[data-testid='fieldset']",
    ) as HTMLElement;
    expect(fieldset).toBeTruthy();
  });

  // ── 4. Notched outline variant shows gap in border for legend ─
  it("notched outline variant shows gap in border for legend", () => {
    const { container } = render(
      <AICFieldset label="Outline Section" appearance="legend">
        <p>Content</p>
      </AICFieldset>,
    );

    const legend = container.querySelector(
      "[data-testid='fieldset-legend']",
    );
    expect(legend).toBeTruthy();

    // Legend should be positioned absolute to create gap effect
    const header = container.querySelector(
      "[data-testid='fieldset-header']",
    ) as HTMLElement;
    expect(header.className).toContain("absolute");
    expect(header.className).toContain("-top-3");
  });

  // ── 5. Children render inside content area ──────────────
  it("children render inside content area", () => {
    const { container } = render(
      <AICFieldset label="Group">
        <input data-testid="child-input" type="text" />
        <button data-testid="child-button">Click</button>
      </AICFieldset>,
    );

    const content = container.querySelector(
      "[data-testid='fieldset-content']",
    );
    expect(content).toBeTruthy();
    expect(
      content?.querySelector("[data-testid='child-input']"),
    ).toBeTruthy();
    expect(
      content?.querySelector("[data-testid='child-button']"),
    ).toBeTruthy();
  });
});
