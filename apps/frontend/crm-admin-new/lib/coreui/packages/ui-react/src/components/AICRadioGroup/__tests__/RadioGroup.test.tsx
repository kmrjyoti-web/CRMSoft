/**
 * AICRadioGroup component tests.
 * 6 test cases per P4.3 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICRadioGroup } from "../AICRadioGroup";
import { getNextRadioValue } from "@coreui/ui";
import type { RadioGroupOption } from "@coreui/ui";

const sampleOptions: RadioGroupOption[] = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

const iconOptions: RadioGroupOption[] = [
  { label: "Star", value: "star", icon: "star" as any },
  { label: "Heart", value: "heart", icon: "heart" as any },
];

const imageOptions: RadioGroupOption[] = [
  { label: "Photo A", value: "a", image: "/a.jpg" },
  { label: "Photo B", value: "b", image: "/b.jpg" },
];

const cardOptions: RadioGroupOption[] = [
  { label: "Plan A", value: "a", description: "Basic plan" },
  { label: "Plan B", value: "b", description: "Pro plan" },
];

describe("AICRadioGroup", () => {
  // ── 1. Single selection only ───────────────────────────
  it("allows only single selection", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICRadioGroup options={sampleOptions} onChange={onChange} />,
    );

    // AICSelect "Small"
    const smOpt = container.querySelector(
      "[data-testid='radio-group-option-sm']",
    ) as HTMLElement;
    fireEvent.click(smOpt.querySelector("input")!);
    expect(onChange).toHaveBeenCalledWith("sm");

    // AICSelect "Large" — should replace, not add
    const lgOpt = container.querySelector(
      "[data-testid='radio-group-option-lg']",
    ) as HTMLElement;
    fireEvent.click(lgOpt.querySelector("input")!);
    expect(onChange).toHaveBeenCalledWith("lg");
  });

  // ── 2. Icon variant shows icons ────────────────────────
  it("renders icons for options with icon property", () => {
    const { container } = render(
      <AICRadioGroup options={iconOptions} />,
    );

    const starIcon = container.querySelector(
      "[data-testid='radio-group-icon-star']",
    );
    expect(starIcon).toBeTruthy();

    const heartIcon = container.querySelector(
      "[data-testid='radio-group-icon-heart']",
    );
    expect(heartIcon).toBeTruthy();
  });

  // ── 3. Image variant shows images ─────────────────────
  it("renders images for options with image property", () => {
    const { container } = render(
      <AICRadioGroup options={imageOptions} />,
    );

    const imgA = container.querySelector(
      "[data-testid='radio-group-image-a']",
    ) as HTMLImageElement;
    expect(imgA).toBeTruthy();
    expect(imgA.src).toContain("/a.jpg");
  });

  // ── 4. Card layout renders descriptions ────────────────
  it("renders option descriptions in card layout", () => {
    const { container } = render(
      <AICRadioGroup options={cardOptions} />,
    );

    const optA = container.querySelector(
      "[data-testid='radio-group-option-a']",
    );
    expect(optA?.textContent).toContain("Basic plan");
  });

  // ── 5. Keyboard arrows switch selection ────────────────
  it("navigates with keyboard arrows", () => {
    // Pure logic test
    expect(getNextRadioValue(sampleOptions, "sm", "next")).toBe("md");
    expect(getNextRadioValue(sampleOptions, "lg", "next")).toBe("sm"); // wraps
    expect(getNextRadioValue(sampleOptions, "sm", "prev")).toBe("lg"); // wraps
    expect(getNextRadioValue(sampleOptions, "md", "prev")).toBe("sm");

    const onChange = vi.fn();
    const { container } = render(
      <AICRadioGroup options={sampleOptions} value="sm" onChange={onChange} />,
    );

    const groupContainer = container.querySelector(
      "[data-testid='radio-group-container']",
    ) as HTMLElement;

    // ArrowDown moves to next
    fireEvent.keyDown(groupContainer, { key: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith("md");
  });

  // ── 6. onChange fires with selected value ──────────────
  it("fires onChange with the correct value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICRadioGroup options={sampleOptions} onChange={onChange} />,
    );

    const mdOpt = container.querySelector(
      "[data-testid='radio-group-option-md']",
    ) as HTMLElement;
    fireEvent.click(mdOpt.querySelector("input")!);

    expect(onChange).toHaveBeenCalledWith("md");
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
