/**
 * AICCheckboxGroup component tests.
 * 7 test cases per P4.2 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICCheckboxGroup } from "../AICCheckboxGroup";
import {
  toggleCheckboxValue,
  canDeselect,
  getGridColsClass,
} from "@coreui/ui";
import type { CheckboxGroupOption } from "@coreui/ui";

const sampleOptions: CheckboxGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
];

const optionsWithMeta: CheckboxGroupOption[] = [
  { label: "Premium", value: "premium", icon: "star" as any, description: "Full access plan" },
  { label: "Basic", value: "basic", description: "Limited access" },
];

describe("AICCheckboxGroup", () => {
  // ── 1. Multiple selection ──────────────────────────────
  it("supports multiple selection", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICCheckboxGroup options={sampleOptions} onChange={onChange} />,
    );

    const apple = container.querySelector(
      "[data-testid='checkbox-group-option-apple']",
    ) as HTMLElement;
    const banana = container.querySelector(
      "[data-testid='checkbox-group-option-banana']",
    ) as HTMLElement;

    fireEvent.click(apple);
    expect(onChange).toHaveBeenCalledWith(["apple"]);

    fireEvent.click(banana);
    expect(onChange).toHaveBeenCalledWith(["apple", "banana"]);
  });

  // ── 2. Grid layout renders columns ─────────────────────
  it("renders grid layout with column classes", () => {
    // Pure logic test
    expect(getGridColsClass(2)).toBe("grid-cols-2");
    expect(getGridColsClass(3)).toBe("grid-cols-3");
    expect(getGridColsClass(undefined)).toBe("md:grid-cols-2");

    const { container } = render(
      <AICCheckboxGroup options={sampleOptions} cols={3} />,
    );

    const grid = container.querySelector(
      "[data-testid='checkbox-group-grid']",
    ) as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.className).toContain("grid");
  });

  // ── 3. Min selection enforced ──────────────────────────
  it("enforces minimum selection", () => {
    // Pure logic test
    expect(canDeselect(2, 2)).toBe(false);
    expect(canDeselect(3, 2)).toBe(true);
    expect(canDeselect(1, undefined)).toBe(true);

    const onChange = vi.fn();
    const { container } = render(
      <AICCheckboxGroup
        options={sampleOptions}
        value={["apple", "banana"]}
        minSelection={2}
        onChange={onChange}
      />,
    );

    // Try to deselect apple — should be blocked by minSelection
    const apple = container.querySelector(
      "[data-testid='checkbox-group-option-apple']",
    ) as HTMLElement;
    fireEvent.click(apple);

    // onChange should not fire (deselection prevented)
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── 4. Max selection enforced ──────────────────────────
  it("enforces maximum selection", () => {
    // Pure logic test
    const result = toggleCheckboxValue(["apple", "banana"], "cherry", 2);
    expect(result).toEqual(["apple", "banana"]); // No change — at max

    const onChange = vi.fn();
    const { container } = render(
      <AICCheckboxGroup
        options={sampleOptions}
        maxSelection={2}
        onChange={onChange}
      />,
    );

    // AICSelect first two
    fireEvent.click(
      container.querySelector(
        "[data-testid='checkbox-group-option-apple']",
      ) as HTMLElement,
    );
    fireEvent.click(
      container.querySelector(
        "[data-testid='checkbox-group-option-banana']",
      ) as HTMLElement,
    );

    // Try third — should be blocked
    fireEvent.click(
      container.querySelector(
        "[data-testid='checkbox-group-option-cherry']",
      ) as HTMLElement,
    );

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toEqual(["apple", "banana"]);
  });

  // ── 5. AICSelect all toggles ─────────────────────────────
  it("select all selects all options", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICCheckboxGroup
        options={sampleOptions}
        label="Fruits"
        onChange={onChange}
      />,
    );

    const selectAllBtn = container.querySelector(
      "[data-testid='checkbox-group-select-all']",
    ) as HTMLElement;
    fireEvent.click(selectAllBtn);

    expect(onChange).toHaveBeenCalledWith([
      "apple",
      "banana",
      "cherry",
      "date",
    ]);
  });

  // ── 6. Card option with description renders ────────────
  it("renders card options with descriptions", () => {
    const { container } = render(
      <AICCheckboxGroup options={optionsWithMeta} />,
    );

    const desc = container.querySelector(
      "[data-testid='checkbox-group-description-premium']",
    );
    expect(desc).toBeTruthy();
    expect(desc?.textContent).toContain("Full access plan");
  });

  // ── 7. Icon option renders icon ────────────────────────
  it("renders icon for options with icon property", () => {
    const { container } = render(
      <AICCheckboxGroup options={optionsWithMeta} />,
    );

    const iconEl = container.querySelector(
      "[data-testid='checkbox-group-icon-premium']",
    );
    expect(iconEl).toBeTruthy();
  });
});
