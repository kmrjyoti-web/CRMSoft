/**
 * AICAutocomplete component tests.
 * 10 test cases per P3.3 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { AICAutocomplete } from "../AICAutocomplete";
import {
  filterAutocompleteOptions,
  highlightMatch,
  findAutocompleteOption,
} from "@coreui/ui";
import type { AutocompleteOption } from "@coreui/ui";

const sampleOptions: AutocompleteOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Grape", value: "grape", disabled: true },
  { label: "Apricot", value: "apricot" },
];

describe("AICAutocomplete", () => {
  // ── 1. Renders input and opens on typing ───────────────
  it("opens dropdown when user types enough characters", () => {
    const { container } = render(
      <AICAutocomplete options={sampleOptions} minChars={1} />,
    );

    const input = container.querySelector(
      "[data-testid='autocomplete-input']",
    ) as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "a" } });

    expect(
      container.querySelector("[data-testid='autocomplete-dropdown']"),
    ).toBeTruthy();
  });

  // ── 2. Filters by "contains" operator (default) ───────
  it("filters options using contains operator", () => {
    const results = filterAutocompleteOptions(sampleOptions, "an", "contains");
    expect(results.length).toBe(1);
    expect(results[0].value).toBe("banana");
  });

  // ── 3. Filters by "startsWith" operator ────────────────
  it("filters options using startsWith operator", () => {
    const results = filterAutocompleteOptions(
      sampleOptions,
      "ap",
      "startsWith",
    );
    expect(results.length).toBe(2);
    expect(results.map((r) => r.value)).toEqual(["apple", "apricot"]);
  });

  // ── 4. Filters by "equals" operator ────────────────────
  it("filters options using equals operator", () => {
    const results = filterAutocompleteOptions(
      sampleOptions,
      "apple",
      "equals",
    );
    expect(results.length).toBe(1);
    expect(results[0].value).toBe("apple");
  });

  // ── 5. Highlight match segments ────────────────────────
  it("produces correct highlight segments", () => {
    const segments = highlightMatch("Banana", "an");
    expect(segments.length).toBe(3);
    expect(segments[0]).toEqual({ text: "B", highlighted: false });
    expect(segments[1]).toEqual({ text: "an", highlighted: true });
    expect(segments[2]).toEqual({ text: "ana", highlighted: false });
  });

  // ── 6. Selecting an option fires onChange ──────────────
  it("fires onChange with selected option on click", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICAutocomplete
        options={sampleOptions}
        onChange={onChange}
        minChars={1}
      />,
    );

    const input = container.querySelector(
      "[data-testid='autocomplete-input']",
    ) as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Ap" } });

    // Click "Apple"
    const appleOpt = container.querySelector(
      "[data-testid='autocomplete-option-apple']",
    ) as HTMLElement;
    fireEvent.click(appleOpt);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "apple", label: "Apple" }),
    );
  });

  // ── 7. Keyboard navigation (ArrowDown/Enter/Escape) ───
  it("supports keyboard navigation", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICAutocomplete
        options={sampleOptions}
        onChange={onChange}
        minChars={1}
      />,
    );

    const input = container.querySelector(
      "[data-testid='autocomplete-input']",
    ) as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "a" } });

    // ArrowDown twice to highlight second result
    fireEvent.keyDown(container.querySelector(".relative")!, {
      key: "ArrowDown",
    });
    fireEvent.keyDown(container.querySelector(".relative")!, {
      key: "ArrowDown",
    });

    // Enter selects highlighted
    fireEvent.keyDown(container.querySelector(".relative")!, {
      key: "Enter",
    });

    expect(onChange).toHaveBeenCalled();

    // Re-type and use Escape
    fireEvent.change(input, { target: { value: "b" } });
    expect(
      container.querySelector("[data-testid='autocomplete-dropdown']"),
    ).toBeTruthy();

    fireEvent.keyDown(container.querySelector(".relative")!, {
      key: "Escape",
    });
    expect(
      container.querySelector("[data-testid='autocomplete-dropdown']"),
    ).toBeNull();
  });

  // ── 8. Clear button resets ─────────────────────────────
  it("clears input and selection on clear button click", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICAutocomplete
        options={sampleOptions}
        onChange={onChange}
        minChars={1}
      />,
    );

    const input = container.querySelector(
      "[data-testid='autocomplete-input']",
    ) as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Apple" } });

    // AICSelect Apple
    const appleOpt = container.querySelector(
      "[data-testid='autocomplete-option-apple']",
    ) as HTMLElement;
    fireEvent.click(appleOpt);

    // Now clear
    const clearBtn = container.querySelector(
      "[data-testid='autocomplete-clear']",
    ) as HTMLElement;
    fireEvent.click(clearBtn);

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe("");
  });

  // ── 9. findAutocompleteOption utility ──────────────────
  it("findAutocompleteOption returns correct option", () => {
    const opt = findAutocompleteOption(sampleOptions, "cherry");
    expect(opt?.label).toBe("Cherry");

    const notFound = findAutocompleteOption(sampleOptions, "mango");
    expect(notFound).toBeUndefined();

    const nullSearch = findAutocompleteOption(sampleOptions, null);
    expect(nullSearch).toBeUndefined();
  });

  // ── 10. Debounce fires onSearch after delay ────────────
  it("debounces onSearch callback", async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();

    const { container } = render(
      <AICAutocomplete
        options={sampleOptions}
        onSearch={onSearch}
        debounceMs={300}
        minChars={1}
      />,
    );

    const input = container.querySelector(
      "[data-testid='autocomplete-input']",
    ) as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "app" } });

    // Not called yet
    expect(onSearch).not.toHaveBeenCalled();

    // Advance time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledWith("app");

    vi.useRealTimers();
  });
});
