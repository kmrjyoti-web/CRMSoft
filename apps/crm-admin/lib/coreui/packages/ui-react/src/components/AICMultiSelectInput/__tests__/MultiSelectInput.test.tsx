/**
 * AICMultiSelectInput component tests.
 * 7 test cases per P3.2 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICMultiSelectInput } from "../AICMultiSelectInput";
import {
  filterMultiSelectOptions,
  getMultiSelectDisplayLabel,
  canSelectMore,
} from "@coreui/ui";
import type { MultiSelectOption } from "@coreui/ui";

const sampleOptions: MultiSelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Grape", value: "grape", disabled: true },
];

describe("AICMultiSelectInput", () => {
  // ── 1. Renders and opens dropdown on click ─────────────
  it("opens dropdown with all options on click", () => {
    const { container } = render(
      <AICMultiSelectInput options={sampleOptions} />,
    );

    const trigger = container.querySelector(
      "[data-testid='multi-select-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    expect(
      container.querySelector("[data-testid='multi-select-dropdown']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='multi-select-option-apple']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='multi-select-option-banana']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='multi-select-option-cherry']"),
    ).toBeTruthy();
  });

  // ── 2. Toggling an option adds/removes from selection ──
  it("toggles option selection and fires onChange", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICMultiSelectInput options={sampleOptions} onChange={onChange} />,
    );

    // Open
    const trigger = container.querySelector(
      "[data-testid='multi-select-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    // AICSelect "Apple"
    const appleOpt = container.querySelector(
      "[data-testid='multi-select-option-apple']",
    ) as HTMLElement;
    fireEvent.click(appleOpt);

    expect(onChange).toHaveBeenCalledWith(["apple"]);

    // AICSelect "Banana"
    const bananaOpt = container.querySelector(
      "[data-testid='multi-select-option-banana']",
    ) as HTMLElement;
    fireEvent.click(bananaOpt);

    expect(onChange).toHaveBeenCalledWith(["apple", "banana"]);
  });

  // ── 3. Chip X button removes the option ────────────────
  it("removes an option when chip X is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICMultiSelectInput
        options={sampleOptions}
        value={["apple", "banana"]}
        onChange={onChange}
      />,
    );

    // Click remove on "apple" chip
    const removeBtn = container.querySelector(
      "[data-testid='multi-select-chip-remove-apple']",
    ) as HTMLElement;
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledWith(["banana"]);
  });

  // ── 4. AICSelect All selects all enabled options ──────────
  it("select all selects all non-disabled options", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICMultiSelectInput options={sampleOptions} onChange={onChange} />,
    );

    // Open
    const trigger = container.querySelector(
      "[data-testid='multi-select-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    // Click AICSelect All
    const selectAllBtn = container.querySelector(
      "[data-testid='multi-select-select-all']",
    ) as HTMLElement;
    fireEvent.click(selectAllBtn);

    // Should select all non-disabled: apple, banana, cherry (not grape)
    expect(onChange).toHaveBeenCalledWith(["apple", "banana", "cherry"]);
  });

  // ── 5. Deselect All clears selection ───────────────────
  it("deselect all clears all selections", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICMultiSelectInput
        options={sampleOptions}
        value={["apple", "banana"]}
        onChange={onChange}
      />,
    );

    // Open
    const trigger = container.querySelector(
      "[data-testid='multi-select-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    // Click Deselect All
    const deselectAllBtn = container.querySelector(
      "[data-testid='multi-select-deselect-all']",
    ) as HTMLElement;
    fireEvent.click(deselectAllBtn);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  // ── 6. Max selection enforced ──────────────────────────
  it("enforces maxSelection limit", () => {
    // Pure logic test
    expect(canSelectMore(2, 3)).toBe(true);
    expect(canSelectMore(3, 3)).toBe(false);
    expect(canSelectMore(5, undefined)).toBe(true);

    const onChange = vi.fn();
    const { container } = render(
      <AICMultiSelectInput
        options={sampleOptions}
        maxSelection={2}
        onChange={onChange}
      />,
    );

    // Open
    const trigger = container.querySelector(
      "[data-testid='multi-select-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    // AICSelect first two
    fireEvent.click(
      container.querySelector(
        "[data-testid='multi-select-option-apple']",
      ) as HTMLElement,
    );
    fireEvent.click(
      container.querySelector(
        "[data-testid='multi-select-option-banana']",
      ) as HTMLElement,
    );

    // Try to select third — should not add
    fireEvent.click(
      container.querySelector(
        "[data-testid='multi-select-option-cherry']",
      ) as HTMLElement,
    );

    // Last call should still be ["apple", "banana"]
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toEqual(["apple", "banana"]);
  });

  // ── 7. Search filters options and display label ────────
  it("filters options by search query", () => {
    // Pure logic tests
    const results = filterMultiSelectOptions(sampleOptions, "ban");
    expect(results.length).toBe(1);
    expect(results[0].value).toBe("banana");

    expect(getMultiSelectDisplayLabel(["apple"], sampleOptions)).toBe("Apple");
    expect(
      getMultiSelectDisplayLabel(["apple", "banana"], sampleOptions),
    ).toBe("2 items selected");
  });
});
