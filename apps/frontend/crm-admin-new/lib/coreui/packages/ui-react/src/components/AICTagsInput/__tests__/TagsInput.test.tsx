/**
 * AICTagsInput component tests.
 * 7 test cases per P7.3 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICTagsInput } from "../AICTagsInput";
import { addTag, removeTag, removeLastTag, filterSuggestions, canAddTag } from "@coreui/ui";

describe("AICTagsInput", () => {
  // ── 1. Enter adds tag ───────────────────────────────────
  it("enter adds tag", () => {
    // Pure logic test
    expect(addTag([], "react")).toEqual(["react"]);
    expect(addTag(["react"], "vue")).toEqual(["react", "vue"]);

    const onChange = vi.fn();
    const { container } = render(<AICTagsInput onChange={onChange} />);

    const input = container.querySelector(
      "[data-testid='tags-input-field']",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "typescript" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(["typescript"]);
  });

  // ── 2. X removes tag ───────────────────────────────────
  it("x removes tag", () => {
    // Pure logic test
    expect(removeTag(["a", "b", "c"], 1)).toEqual(["a", "c"]);

    const onChange = vi.fn();
    const { container } = render(
      <AICTagsInput value={["react", "vue"]} onChange={onChange} />,
    );

    const removeBtn = container.querySelector(
      "[data-testid='tag-remove-0']",
    ) as HTMLElement;
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(["vue"]);
  });

  // ── 3. Duplicate prevented ──────────────────────────────
  it("duplicate prevented", () => {
    // Pure logic test
    expect(addTag(["react"], "react")).toEqual(["react"]);
    expect(canAddTag(["react"], "react")).toBe(false);
    expect(canAddTag(["react"], "vue")).toBe(true);

    const onChange = vi.fn();
    const { container } = render(
      <AICTagsInput value={["react"]} onChange={onChange} />,
    );

    const input = container.querySelector(
      "[data-testid='tags-input-field']",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "react" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // onChange should NOT be called since it's a duplicate
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── 4. Max tags enforced ────────────────────────────────
  it("max tags enforced", () => {
    // Pure logic test
    expect(addTag(["a", "b"], "c", 2)).toEqual(["a", "b"]);
    expect(addTag(["a"], "b", 2)).toEqual(["a", "b"]);
  });

  // ── 5. AICAutocomplete suggests matches ────────────────────
  it("autocomplete suggests matches", () => {
    // Pure logic test
    const suggestions = ["react", "redux", "vue", "angular"];
    expect(filterSuggestions(suggestions, "re", [])).toEqual(["react", "redux"]);
    expect(filterSuggestions(suggestions, "re", ["react"])).toEqual(["redux"]);
    expect(filterSuggestions(suggestions, "", [])).toEqual([]);

    const { container } = render(
      <AICTagsInput suggestions={["react", "redux", "vue"]} />,
    );

    const input = container.querySelector(
      "[data-testid='tags-input-field']",
    ) as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "re" } });

    const suggestionList = container.querySelector(
      "[data-testid='tags-suggestions']",
    );
    expect(suggestionList).toBeTruthy();
  });

  // ── 6. Backspace removes last tag ───────────────────────
  it("backspace removes last tag", () => {
    // Pure logic test
    expect(removeLastTag(["a", "b", "c"])).toEqual(["a", "b"]);
    expect(removeLastTag([])).toEqual([]);

    const onChange = vi.fn();
    const { container } = render(
      <AICTagsInput value={["react", "vue"]} onChange={onChange} />,
    );

    const input = container.querySelector(
      "[data-testid='tags-input-field']",
    ) as HTMLInputElement;
    fireEvent.keyDown(input, { key: "Backspace" });

    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  // ── 7. onChange fires with tags array ───────────────────
  it("onChange fires with tags array", () => {
    const onChange = vi.fn();
    const { container } = render(<AICTagsInput onChange={onChange} />);

    const input = container.querySelector(
      "[data-testid='tags-input-field']",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(["hello"]);
    expect(Array.isArray(onChange.mock.calls[0][0])).toBe(true);
  });
});
