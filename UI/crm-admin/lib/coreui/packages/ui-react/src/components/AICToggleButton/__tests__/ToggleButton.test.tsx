/**
 * AICToggleButton + AICSegmentedControl tests.
 * 5 test cases per P4.5 spec (combined).
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICToggleButton } from "../AICToggleButton";
import { AICSegmentedControl } from "../../AICSegmentedControl/AICSegmentedControl";
import type { SegmentOption } from "@coreui/ui";

const segmentOptions: SegmentOption[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const iconSegmentOptions: SegmentOption[] = [
  { label: "List", value: "list", icon: "list" as any },
  { label: "Grid", value: "grid", icon: "grid" as any },
];

describe("AICToggleButton + AICSegmentedControl", () => {
  // ── 1. Toggle buttons allow multiple active ────────────
  it("toggle button toggles active state", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICToggleButton label="Feature" onChange={onChange} />,
    );

    const btn = container.querySelector(
      "[data-testid='toggle-button']",
    ) as HTMLButtonElement;

    // Initially inactive — no checkmark
    expect(
      container.querySelector("[data-testid='toggle-button-checkmark']"),
    ).toBeNull();

    // Click to activate
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(true);

    // Checkmark should appear
    expect(
      container.querySelector("[data-testid='toggle-button-checkmark']"),
    ).toBeTruthy();

    // Click to deactivate
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  // ── 2. Segmented allows single only ────────────────────
  it("segmented control allows only single selection", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSegmentedControl options={segmentOptions} onChange={onChange} />,
    );

    // AICSelect "Day"
    const dayBtn = container.querySelector(
      "[data-testid='segment-option-day']",
    ) as HTMLElement;
    fireEvent.click(dayBtn);
    expect(onChange).toHaveBeenCalledWith("day");

    // AICSelect "Week" — should replace, not add
    const weekBtn = container.querySelector(
      "[data-testid='segment-option-week']",
    ) as HTMLElement;
    fireEvent.click(weekBtn);
    expect(onChange).toHaveBeenCalledWith("week");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  // ── 3. Icon+text renders both ──────────────────────────
  it("renders icon and text together", () => {
    const { container } = render(
      <AICSegmentedControl options={iconSegmentOptions} />,
    );

    const listIcon = container.querySelector(
      "[data-testid='segment-icon-list']",
    );
    expect(listIcon).toBeTruthy();

    const listOpt = container.querySelector(
      "[data-testid='segment-option-list']",
    );
    expect(listOpt?.textContent).toContain("List");

    // Toggle button with icon
    const { container: toggleContainer } = render(
      <AICToggleButton label="Star" icon={"star" as any} />,
    );
    expect(
      toggleContainer.querySelector("[data-testid='toggle-button-icon']"),
    ).toBeTruthy();
    expect(
      toggleContainer.querySelector("[data-testid='toggle-button']")
        ?.textContent,
    ).toContain("Star");
  });

  // ── 4. Size variants apply ─────────────────────────────
  it("applies size variant classes", () => {
    const { container: smContainer } = render(
      <AICToggleButton label="Small" size="sm" />,
    );
    const smBtn = smContainer.querySelector(
      "[data-testid='toggle-button']",
    ) as HTMLElement;
    expect(smBtn.className).toContain("text-sm");

    const { container: lgContainer } = render(
      <AICToggleButton label="Large" size="lg" />,
    );
    const lgBtn = lgContainer.querySelector(
      "[data-testid='toggle-button']",
    ) as HTMLElement;
    expect(lgBtn.className).toContain("text-lg");
  });

  // ── 5. onChange fires with selected value(s) ───────────
  it("fires onChange with correct values", () => {
    // Toggle button
    const toggleOnChange = vi.fn();
    const { container: toggleContainer } = render(
      <AICToggleButton label="Test" onChange={toggleOnChange} />,
    );
    fireEvent.click(
      toggleContainer.querySelector(
        "[data-testid='toggle-button']",
      ) as HTMLElement,
    );
    expect(toggleOnChange).toHaveBeenCalledWith(true);

    // Segmented control
    const segOnChange = vi.fn();
    const { container: segContainer } = render(
      <AICSegmentedControl options={segmentOptions} onChange={segOnChange} />,
    );
    fireEvent.click(
      segContainer.querySelector(
        "[data-testid='segment-option-month']",
      ) as HTMLElement,
    );
    expect(segOnChange).toHaveBeenCalledWith("month");
  });
});
