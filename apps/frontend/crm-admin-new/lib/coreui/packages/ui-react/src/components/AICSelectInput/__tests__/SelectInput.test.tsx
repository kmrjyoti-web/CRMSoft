/**
 * AICSelectInput component tests.
 * 8 test cases per P3.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICSelectInput } from "../AICSelectInput";
import {
  filterSelectOptions,
  groupSelectOptions,
} from "@coreui/ui";
import type { SelectInputOption } from "@coreui/ui";

const sampleOptions: SelectInputOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Grape", value: "grape", disabled: true },
];

const groupedOptions: SelectInputOption[] = [
  { label: "Apple", value: "apple", group: "Fruits" },
  { label: "Banana", value: "banana", group: "Fruits" },
  { label: "Carrot", value: "carrot", group: "Vegetables" },
  { label: "Broccoli", value: "broccoli", group: "Vegetables" },
];

describe("AICSelectInput", () => {
  // ── 1. Renders options from static array ─────────────────
  it("renders options from static array", () => {
    const { container } = render(
      <AICSelectInput options={sampleOptions} />,
    );

    // Open dropdown
    const trigger = container.querySelector(
      "[data-testid='select-input-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    // Verify all options rendered
    expect(container.querySelector("[data-testid='select-option-apple']")).toBeTruthy();
    expect(container.querySelector("[data-testid='select-option-banana']")).toBeTruthy();
    expect(container.querySelector("[data-testid='select-option-cherry']")).toBeTruthy();
    expect(container.querySelector("[data-testid='select-option-grape']")).toBeTruthy();
  });

  // ── 2. Search filters options ────────────────────────────
  it("filters options by search", () => {
    // Pure logic function test
    const results = filterSelectOptions(sampleOptions, "ban");
    expect(results.length).toBe(1);
    expect(results[0].value).toBe("banana");

    // Empty search returns all
    const all = filterSelectOptions(sampleOptions, "");
    expect(all.length).toBe(sampleOptions.length);
  });

  // ── 3. AICSelect fires onChange with value ──────────────────
  it("fires onChange when selecting an option", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSelectInput options={sampleOptions} onChange={onChange} />,
    );

    // Open
    const trigger = container.querySelector(
      "[data-testid='select-input-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    // AICSelect "Banana"
    const bananaOption = container.querySelector(
      "[data-testid='select-option-banana']",
    ) as HTMLElement;
    fireEvent.click(bananaOption);

    expect(onChange).toHaveBeenCalledWith("banana");
  });

  // ── 4. Clear button resets to empty ──────────────────────
  it("clears selection when clear button is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSelectInput
        options={sampleOptions}
        value="apple"
        clearable
        onChange={onChange}
      />,
    );

    // Clear button should be visible
    const clearBtn = container.querySelector(
      "[data-testid='select-input-clear']",
    ) as HTMLElement;
    expect(clearBtn).toBeTruthy();

    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  // ── 5. Grouped options render with headers ───────────────
  it("renders grouped options with section headers", () => {
    // Pure logic test
    const groups = groupSelectOptions(groupedOptions);
    expect(groups.length).toBe(2);
    expect(groups[0].group).toBe("Fruits");
    expect(groups[0].options.length).toBe(2);
    expect(groups[1].group).toBe("Vegetables");
    expect(groups[1].options.length).toBe(2);

    // Component rendering
    const { container } = render(
      <AICSelectInput options={groupedOptions} />,
    );

    const trigger = container.querySelector(
      "[data-testid='select-input-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    // Group headers should exist
    expect(container.querySelector("[data-testid='select-group-Fruits']")).toBeTruthy();
    expect(container.querySelector("[data-testid='select-group-Vegetables']")).toBeTruthy();
  });

  // ── 6. Disabled options cannot be selected ───────────────
  it("does not select disabled options", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSelectInput options={sampleOptions} onChange={onChange} />,
    );

    // Open
    const trigger = container.querySelector(
      "[data-testid='select-input-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    // Click disabled "Grape"
    const grapeOption = container.querySelector(
      "[data-testid='select-option-grape']",
    ) as HTMLElement;
    fireEvent.click(grapeOption);

    // onChange should NOT be called
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── 7. ArrowDown navigates, Enter selects, Escape closes ─
  it("supports keyboard navigation", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSelectInput options={sampleOptions} onChange={onChange} />,
    );

    const trigger = container.querySelector(
      "[data-testid='select-input-trigger']",
    ) as HTMLElement;

    // Focus the trigger
    fireEvent.focus(trigger.parentElement!);

    // ArrowDown opens dropdown
    fireEvent.keyDown(trigger.parentElement!, { key: "ArrowDown" });
    expect(
      container.querySelector("[data-testid='select-input-dropdown']"),
    ).toBeTruthy();

    // ArrowDown highlights first option
    fireEvent.keyDown(trigger.parentElement!, { key: "ArrowDown" });

    // Enter selects the highlighted option (Apple, index 0 — but Grape is disabled)
    // First selectable: Apple (index 0)
    fireEvent.keyDown(trigger.parentElement!, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("apple");

    // Reopen
    fireEvent.click(trigger);

    // Escape closes
    fireEvent.keyDown(trigger.parentElement!, { key: "Escape" });
    expect(
      container.querySelector("[data-testid='select-input-dropdown']"),
    ).toBeNull();
  });

  // ── 8. Dependent select reloads on parent change ─────────
  it("clears selection when parentValue changes (dependent select)", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <AICSelectInput
        options={sampleOptions}
        value="apple"
        apiConfig={{
          endpoint: "/api/states",
          labelKey: "name",
          valueKey: "id",
          dependency: "country",
        }}
        parentValue="US"
        onChange={onChange}
      />,
    );

    // Parent changes to "IN"
    rerender(
      <AICSelectInput
        options={[
          { label: "Delhi", value: "delhi" },
          { label: "Mumbai", value: "mumbai" },
        ]}
        apiConfig={{
          endpoint: "/api/states",
          labelKey: "name",
          valueKey: "id",
          dependency: "country",
        }}
        parentValue="IN"
        onChange={onChange}
      />,
    );

    // Selection should have been cleared
    expect(onChange).toHaveBeenCalledWith(null);

    // Verify new options are available
    const trigger = container.querySelector(
      "[data-testid='select-input-trigger']",
    ) as HTMLElement;
    fireEvent.click(trigger);

    expect(
      container.querySelector("[data-testid='select-option-delhi']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='select-option-mumbai']"),
    ).toBeTruthy();
  });
});
