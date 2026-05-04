/**
 * AICRating component tests.
 * 6 test cases per P7.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICRating } from "../AICRating";
import { generateStars, isStarFilled, computeRatingFromEvent } from "@coreui/ui";

describe("AICRating", () => {
  // ── 1. Click sets rating ────────────────────────────────
  it("click sets rating", () => {
    const onChange = vi.fn();
    const { container } = render(<AICRating onChange={onChange} />);

    const star3 = container.querySelector(
      "[data-testid='rating-star-3']",
    ) as HTMLElement;
    fireEvent.click(star3);
    expect(onChange).toHaveBeenCalledWith(3);

    // Value display shows
    const value = container.querySelector(
      "[data-testid='rating-value']",
    );
    expect(value?.textContent).toContain("3");
  });

  // ── 2. Half-star on edge click ──────────────────────────
  it("half-star on edge click", () => {
    // Pure logic test
    expect(computeRatingFromEvent(3, true, 5, 40)).toBe(2.5);
    expect(computeRatingFromEvent(3, true, 25, 40)).toBe(3);
    expect(computeRatingFromEvent(3, false, 5, 40)).toBe(3);
  });

  // ── 3. Readonly prevents interaction ────────────────────
  it("readonly prevents interaction", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICRating value={3} readonly onChange={onChange} />,
    );

    const star1 = container.querySelector(
      "[data-testid='rating-star-1']",
    ) as HTMLElement;
    fireEvent.click(star1);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── 4. Custom icon renders ──────────────────────────────
  it("custom icon renders", () => {
    const { container } = render(
      <AICRating icon={<span data-testid="custom-icon">&#9829;</span>} />,
    );

    const icons = container.querySelectorAll("[data-testid='custom-icon']");
    expect(icons.length).toBe(5);
    expect(icons[0].textContent).toBe("\u2665");
  });

  // ── 5. Hover shows preview ──────────────────────────────
  it("hover shows preview", () => {
    // Pure logic test
    expect(generateStars(5)).toEqual([1, 2, 3, 4, 5]);
    expect(isStarFilled(3, 4, 2)).toBe(true); // hover=4 fills up to 4
    expect(isStarFilled(5, 4, 2)).toBe(false);
    expect(isStarFilled(3, 0, 2)).toBe(false);
    expect(isStarFilled(2, 0, 2)).toBe(true);

    const { container } = render(<AICRating value={2} />);

    // Hover over star 4
    const star4 = container.querySelector(
      "[data-testid='rating-star-4']",
    ) as HTMLElement;
    fireEvent.mouseEnter(star4);

    // Value display should show hover value
    const value = container.querySelector(
      "[data-testid='rating-value']",
    );
    expect(value?.textContent).toContain("4");
  });

  // ── 6. onChange fires with value ────────────────────────
  it("onChange fires with value", () => {
    const onChange = vi.fn();
    const { container } = render(<AICRating onChange={onChange} />);

    fireEvent.click(
      container.querySelector("[data-testid='rating-star-5']") as HTMLElement,
    );
    expect(onChange).toHaveBeenCalledWith(5);
    expect(typeof onChange.mock.calls[0][0]).toBe("number");
  });
});
