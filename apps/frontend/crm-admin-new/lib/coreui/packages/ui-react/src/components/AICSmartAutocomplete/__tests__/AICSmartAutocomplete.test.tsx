/**
 * AICAutocomplete component tests.
 * 16 test cases covering rendering, interaction, keyboard navigation,
 * helper dropdown, filter badges, and callbacks.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { AICAutocomplete } from "../AICAutocomplete";
import {
  parseQuery,
  buildHelperItems,
  moveHelperSelection,
  buildSelectionLabel,
  buildPlaceholder,
} from "@coreui/ui";
import type { AutocompleteSourceConfig } from "@coreui/ui";

// ── Test Fixtures ───────────────────────────

const sampleItems = [
  { name: "Apple Inc.", code: "AAPL", sector: "Technology" },
  { name: "Banana Corp.", code: "BANA", sector: "Food" },
  { name: "Cherry Ltd.", code: "CHRY", sector: "Food" },
];

const sampleSourceConfig: AutocompleteSourceConfig = {
  key: "companies",
  takeDefault: 10,
  fields: [
    {
      code: "NAME",
      label: "Company Name",
      parameterName: "company_name",
      defaultWildcard: "CONTAINS",
    },
    {
      code: "CODE",
      label: "Company Code",
      parameterName: "company_code",
      defaultWildcard: "STARTS_WITH",
    },
    {
      code: "SECTOR",
      label: "Sector",
      parameterName: "sector",
      defaultWildcard: "EXACT",
      allowNot: true,
    },
  ],
  viewMode: "general",
  showClear: true,
  selectionConfig: {
    displayField: "name",
  },
  featureFlags: {
    shiftHelperEnabled: true,
    fieldBadgesEnabled: true,
    shortcutsEnabled: true,
  },
};

/**
 * Helper: type into input, advance debounce timer, flush the fetchFn promise.
 * Must be called inside an async test with fake timers active.
 */
async function typeAndSearch(
  container: HTMLElement,
  value: string,
  fetchFn: ReturnType<typeof vi.fn>
) {
  const input = container.querySelector(
    "[data-testid='aic-autocomplete-input']"
  ) as HTMLInputElement;

  // Type the value — this opens the panel and schedules the debounce
  fireEvent.change(input, { target: { value } });

  // Advance fake timers past the 400ms debounce
  await act(async () => {
    vi.advanceTimersByTime(500);
  });

  // The debounce callback fired executeSearch, which calls fetchFn (a resolved
  // promise). We need one more microtask flush for the state update.
  await act(async () => {
    await Promise.resolve();
  });
}

describe("AICAutocomplete", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── 1. Renders with label ─────────────────
  it("renders with label", () => {
    const { container } = render(
      <AICAutocomplete
        sourceConfig={sampleSourceConfig}
        label="Search Companies"
      />
    );

    const label = container.querySelector(
      "[data-testid='aic-autocomplete-label']"
    );
    expect(label).toBeTruthy();
    expect(label?.textContent).toBe("Search Companies");
  });

  // ── 2. Opens panel on input focus ─────────
  it("opens panel on input focus when query meets minLength", () => {
    const fetchFn = vi.fn().mockResolvedValue(sampleItems);
    const config = { ...sampleSourceConfig, fetchFn };

    const { container } = render(
      <AICAutocomplete sourceConfig={config} />
    );

    const input = container.querySelector(
      "[data-testid='aic-autocomplete-input']"
    ) as HTMLInputElement;

    // Typing opens the panel immediately (before debounce)
    fireEvent.change(input, { target: { value: "App" } });

    const panel = container.querySelector(
      "[data-testid='aic-autocomplete-panel']"
    );
    expect(panel).toBeTruthy();
  });

  // ── 3. Displays items in general view ─────
  it("displays items in general view", async () => {
    const fetchFn = vi.fn().mockResolvedValue(sampleItems);
    const config = { ...sampleSourceConfig, fetchFn };

    const { container } = render(
      <AICAutocomplete sourceConfig={config} />
    );

    await typeAndSearch(container, "Apple", fetchFn);

    const generalView = container.querySelector(
      "[data-testid='aic-autocomplete-general-view']"
    );
    expect(generalView).toBeTruthy();

    const item0 = container.querySelector(
      "[data-testid='aic-autocomplete-item-0']"
    );
    expect(item0).toBeTruthy();
  });

  // ── 4. Keyboard ArrowDown moves selection ──
  it("keyboard ArrowDown moves selection", async () => {
    const fetchFn = vi.fn().mockResolvedValue(sampleItems);
    const config = { ...sampleSourceConfig, fetchFn };

    const { container } = render(
      <AICAutocomplete sourceConfig={config} />
    );

    await typeAndSearch(container, "test", fetchFn);

    const wrapper = container.querySelector(".relative") as HTMLElement;

    // ArrowDown should move highlight to first item (index 0)
    fireEvent.keyDown(wrapper, { key: "ArrowDown" });

    const item0 = container.querySelector(
      "[data-testid='aic-autocomplete-item-0']"
    );
    expect(item0?.getAttribute("aria-selected")).toBe("true");

    // ArrowDown again to second item
    fireEvent.keyDown(wrapper, { key: "ArrowDown" });

    const item1 = container.querySelector(
      "[data-testid='aic-autocomplete-item-1']"
    );
    expect(item1?.getAttribute("aria-selected")).toBe("true");
  });

  // ── 5. Enter selects item ─────────────────
  it("Enter selects highlighted item", async () => {
    const fetchFn = vi.fn().mockResolvedValue(sampleItems);
    const config = { ...sampleSourceConfig, fetchFn };
    const onSelect = vi.fn();

    const { container } = render(
      <AICAutocomplete sourceConfig={config} onSelect={onSelect} />
    );

    await typeAndSearch(container, "test", fetchFn);

    const wrapper = container.querySelector(".relative") as HTMLElement;

    // Navigate to first item and press Enter
    fireEvent.keyDown(wrapper, { key: "ArrowDown" });
    fireEvent.keyDown(wrapper, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Apple Inc." })
    );
  });

  // ── 6. Escape closes panel ────────────────
  it("Escape closes panel", async () => {
    const fetchFn = vi.fn().mockResolvedValue(sampleItems);
    const config = { ...sampleSourceConfig, fetchFn };

    const { container } = render(
      <AICAutocomplete sourceConfig={config} />
    );

    await typeAndSearch(container, "test", fetchFn);

    // Panel should be open
    expect(
      container.querySelector("[data-testid='aic-autocomplete-panel']")
    ).toBeTruthy();

    const wrapper = container.querySelector(".relative") as HTMLElement;
    fireEvent.keyDown(wrapper, { key: "Escape" });

    expect(
      container.querySelector("[data-testid='aic-autocomplete-panel']")
    ).toBeNull();
  });

  // ── 7. Clear button clears input ──────────
  it("clears input and calls onReset on clear button click", () => {
    const fetchFn = vi.fn().mockResolvedValue(sampleItems);
    const config = { ...sampleSourceConfig, fetchFn };
    const onReset = vi.fn();
    const onChange = vi.fn();

    const { container } = render(
      <AICAutocomplete
        sourceConfig={config}
        onReset={onReset}
        onChange={onChange}
      />
    );

    const input = container.querySelector(
      "[data-testid='aic-autocomplete-input']"
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Apple" } });

    // Clear button should appear
    const clearBtn = container.querySelector(
      "[data-testid='aic-autocomplete-clear']"
    ) as HTMLElement;
    expect(clearBtn).toBeTruthy();

    fireEvent.click(clearBtn);

    expect(input.value).toBe("");
    expect(onReset).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  // ── 8. Helper dropdown opens on F2 ────────
  it("opens helper dropdown on F2 keypress", () => {
    const { container } = render(
      <AICAutocomplete sourceConfig={sampleSourceConfig} />
    );

    const wrapper = container.querySelector(".relative") as HTMLElement;

    fireEvent.keyDown(wrapper, { key: "F2" });

    const helper = container.querySelector(
      "[data-testid='aic-autocomplete-helper']"
    );
    expect(helper).toBeTruthy();

    // Should contain field items
    const helperItem0 = container.querySelector(
      "[data-testid='aic-autocomplete-helper-item-0']"
    );
    expect(helperItem0).toBeTruthy();
  });

  // ── 9. Filter badges appear for structured queries ──
  it("displays filter badges for structured queries", async () => {
    const fetchFn = vi.fn().mockResolvedValue(sampleItems);
    const config = { ...sampleSourceConfig, fetchFn };

    const { container } = render(
      <AICAutocomplete sourceConfig={config} />
    );

    await typeAndSearch(container, "NAME:Apple", fetchFn);

    const badges = container.querySelector(
      "[data-testid='aic-autocomplete-filter-badges']"
    );
    expect(badges).toBeTruthy();

    const badge0 = container.querySelector(
      "[data-testid='aic-autocomplete-badge-0']"
    );
    expect(badge0).toBeTruthy();
    expect(badge0?.textContent).toContain("NAME");
  });

  // ── 10. Calls onSelect when row clicked ───
  it("calls onSelect when a result row is clicked", async () => {
    const fetchFn = vi.fn().mockResolvedValue(sampleItems);
    const config = { ...sampleSourceConfig, fetchFn };
    const onSelect = vi.fn();

    const { container } = render(
      <AICAutocomplete sourceConfig={config} onSelect={onSelect} />
    );

    await typeAndSearch(container, "test", fetchFn);

    const item = container.querySelector(
      "[data-testid='aic-autocomplete-item-0']"
    ) as HTMLElement;
    fireEvent.click(item);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Apple Inc." })
    );
  });

  // ── 11. parseQuery correctly parses structured queries ──
  it("parseQuery parses structured CODE:value patterns", () => {
    const filters = parseQuery("NAME:Apple", sampleSourceConfig);
    expect(filters.length).toBe(1);
    expect(filters[0].parameter_code).toBe("NAME");
    expect(filters[0].parameter_value).toBe("Apple");
    expect(filters[0].conditional_operator).toBe("AND");
  });

  // ── 12. parseQuery handles NOT operator ────
  it("parseQuery handles NOT operator with ! prefix", () => {
    const filters = parseQuery("SECTOR:!Food", sampleSourceConfig);
    expect(filters.length).toBe(1);
    expect(filters[0].conditional_operator).toBe("NOT");
    expect(filters[0].parameter_value).toBe("Food");
  });

  // ── 13. buildHelperItems generates correct items ──
  it("buildHelperItems produces field and wildcard items", () => {
    const items = buildHelperItems(sampleSourceConfig);
    const fieldItems = items.filter((i: { type: string }) => i.type === "field");
    const wildcardItems = items.filter((i: { type: string }) => i.type === "wildcard");

    expect(fieldItems.length).toBe(3); // NAME, CODE, SECTOR
    expect(wildcardItems.length).toBe(4); // CONTAINS, STARTS_WITH, ENDS_WITH, EXACT
  });

  // ── 14. moveHelperSelection wraps around ───
  it("moveHelperSelection wraps around correctly", () => {
    const items = buildHelperItems(sampleSourceConfig);

    // From null going down starts at 0
    expect(moveHelperSelection(null, items, 1)).toBe(0);

    // From 0 going up wraps to last
    expect(moveHelperSelection(0, items, -1)).toBe(items.length - 1);

    // From last going down wraps to 0
    expect(moveHelperSelection(items.length - 1, items, 1)).toBe(0);
  });

  // ── 15. buildSelectionLabel uses displayField ──
  it("buildSelectionLabel uses displayField config", () => {
    const row = { name: "Test Corp", code: "TST" };
    const label = buildSelectionLabel(row, sampleSourceConfig);
    expect(label).toBe("Test Corp");
  });

  // ── 16. buildPlaceholder generates correct text ──
  it("buildPlaceholder generates correct placeholder text", () => {
    const placeholder = buildPlaceholder(sampleSourceConfig);
    expect(placeholder).toContain("NAME");
    expect(placeholder).toContain("CODE");
    expect(placeholder).toContain("SECTOR");

    // With override
    const customPlaceholder = buildPlaceholder(sampleSourceConfig, {
      placeholder: "Custom search...",
    });
    expect(customPlaceholder).toBe("Custom search...");
  });
});
