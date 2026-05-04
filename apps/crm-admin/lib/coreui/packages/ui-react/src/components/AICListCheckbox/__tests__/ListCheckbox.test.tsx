/**
 * AICListCheckbox component tests.
 * 6 test cases per P3.4 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICListCheckbox } from "../AICListCheckbox";
import {
  filterListCheckboxOptions,
  getVisibleChips,
  getRemainingCount,
} from "@coreui/ui";
import type { ListCheckboxOption } from "@coreui/ui";

const sampleOptions: ListCheckboxOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
  { label: "Fig", value: "fig" },
  { label: "Grape", value: "grape" },
];

describe("AICListCheckbox", () => {
  // ── 1. Renders all options as checkable items ──────────
  it("renders all options with checkboxes", () => {
    const { container } = render(
      <AICListCheckbox options={sampleOptions} />,
    );

    expect(
      container.querySelector("[data-testid='list-checkbox-item-apple']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='list-checkbox-item-banana']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='list-checkbox-item-grape']"),
    ).toBeTruthy();

    // Footer shows 0 selected
    const count = container.querySelector(
      "[data-testid='list-checkbox-count']",
    );
    expect(count?.textContent).toContain("0 selected");
  });

  // ── 2. Clicking an item toggles its selection ─────────
  it("toggles selection on click and fires onChange", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICListCheckbox options={sampleOptions} onChange={onChange} />,
    );

    // Click Apple
    const appleItem = container.querySelector(
      "[data-testid='list-checkbox-item-apple']",
    ) as HTMLElement;
    fireEvent.click(appleItem);

    expect(onChange).toHaveBeenCalledWith(["apple"]);

    // Click Banana
    const bananaItem = container.querySelector(
      "[data-testid='list-checkbox-item-banana']",
    ) as HTMLElement;
    fireEvent.click(bananaItem);

    expect(onChange).toHaveBeenCalledWith(["apple", "banana"]);

    // Un-check Apple
    fireEvent.click(appleItem);

    expect(onChange).toHaveBeenCalledWith(["banana"]);
  });

  // ── 3. Search filters the visible list ─────────────────
  it("filters options by search query", () => {
    // Pure logic test
    const results = filterListCheckboxOptions(sampleOptions, "ber");
    expect(results.length).toBe(1);
    expect(results[0].value).toBe("elderberry");

    const allResults = filterListCheckboxOptions(sampleOptions, "");
    expect(allResults.length).toBe(sampleOptions.length);
  });

  // ── 4. Chips display with maxChips + "+ N more" ───────
  it("displays chips with overflow count", () => {
    // Pure logic test
    const selected = ["apple", "banana", "cherry", "date", "elderberry", "fig"];
    const chips = getVisibleChips(selected, sampleOptions, 3);
    expect(chips.length).toBe(3);
    expect(chips[0].label).toBe("Apple");

    const remaining = getRemainingCount(selected, sampleOptions, 3);
    expect(remaining).toBe(3);

    // Component rendering test
    const { container } = render(
      <AICListCheckbox
        options={sampleOptions}
        value={["apple", "banana", "cherry", "date", "elderberry", "fig"]}
        maxChips={3}
      />,
    );

    // 3 chips should be visible
    expect(
      container.querySelector("[data-testid='list-checkbox-chip-apple']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='list-checkbox-chip-cherry']"),
    ).toBeTruthy();

    // Remaining count
    const remainingEl = container.querySelector(
      "[data-testid='list-checkbox-remaining']",
    );
    expect(remainingEl?.textContent).toContain("+3 more");
  });

  // ── 5. Clear All resets selection ──────────────────────
  it("clears all selections on Clear All click", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICListCheckbox
        options={sampleOptions}
        value={["apple", "banana"]}
        onChange={onChange}
      />,
    );

    const clearAllBtn = container.querySelector(
      "[data-testid='list-checkbox-clear-all']",
    ) as HTMLElement;
    expect(clearAllBtn).toBeTruthy();

    fireEvent.click(clearAllBtn);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  // ── 6. Selection count in footer ───────────────────────
  it("shows correct selection count in footer", () => {
    const { container } = render(
      <AICListCheckbox
        options={sampleOptions}
        value={["apple", "banana", "cherry"]}
      />,
    );

    const count = container.querySelector(
      "[data-testid='list-checkbox-count']",
    );
    expect(count?.textContent).toContain("3 selected");
  });
});
