// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { AICCurrencyInput } from "../AICCurrencyInput";

describe("AICCurrencyInput", () => {
  // ═══════════════════════════════════════════════════════════
  // 1. Renders ₹ prefix by default
  // ═══════════════════════════════════════════════════════════

  it("renders ₹ prefix by default", () => {
    const { container } = render(<AICCurrencyInput />);

    const symbol = container.querySelector(
      "[data-testid='currency-symbol']",
    );
    expect(symbol).not.toBeNull();
    expect(symbol!.textContent).toBe("₹");
  });

  // ═══════════════════════════════════════════════════════════
  // 2. Formats 100000 as ₹1,00,000 (Indian locale)
  // ═══════════════════════════════════════════════════════════

  it("formats 100000 as 1,00,000 with Indian locale", () => {
    const { container } = render(
      <AICCurrencyInput value={100000} locale="en-IN" decimals={0} />,
    );

    const input = container.querySelector(
      "[data-testid='currency-input']",
    ) as HTMLInputElement;

    // When not focused, should show formatted value
    expect(input.value).toBe("1,00,000");
  });

  // ═══════════════════════════════════════════════════════════
  // 3. Formats 100000 as 100,000 (US locale)
  // ═══════════════════════════════════════════════════════════

  it("formats 100000 as 100,000 with US locale", () => {
    const { container } = render(
      <AICCurrencyInput value={100000} locale="en-US" decimals={0} />,
    );

    const input = container.querySelector(
      "[data-testid='currency-input']",
    ) as HTMLInputElement;

    expect(input.value).toBe("100,000");
  });

  // ═══════════════════════════════════════════════════════════
  // 4. Limits decimal to configured places
  // ═══════════════════════════════════════════════════════════

  it("limits decimal to configured places", () => {
    const { container } = render(
      <AICCurrencyInput value={1234.5678} locale="en-US" decimals={2} />,
    );

    const input = container.querySelector(
      "[data-testid='currency-input']",
    ) as HTMLInputElement;

    // Should format to 2 decimal places: 1,234.57
    expect(input.value).toBe("1,234.57");
  });

  // ═══════════════════════════════════════════════════════════
  // 5. Min/max validation works
  // ═══════════════════════════════════════════════════════════

  it("min/max validation works", () => {
    const { container } = render(
      <AICCurrencyInput value={150} min={0} max={100} id="amt" />,
    );

    // Should show an error message about max
    const errorEl = container.querySelector("[role='alert']");
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toContain("at most 100");
  });

  // ═══════════════════════════════════════════════════════════
  // 6. Currency dropdown changes prefix symbol
  // ═══════════════════════════════════════════════════════════

  it("currency dropdown changes prefix symbol", () => {
    const currencies = [
      { symbol: "₹", code: "INR", label: "Indian Rupee" },
      { symbol: "$", code: "USD", label: "US Dollar" },
      { symbol: "€", code: "EUR", label: "Euro" },
    ];

    const onCurrencyChange = vi.fn();
    const { container } = render(
      <AICCurrencyInput
        currencies={currencies}
        onCurrencyChange={onCurrencyChange}
      />,
    );

    // Click the dropdown trigger
    const trigger = container.querySelector(
      "[data-testid='currency-dropdown-trigger']",
    ) as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(trigger.textContent).toContain("₹");

    fireEvent.click(trigger);

    // Dropdown list should appear
    const list = container.querySelector(
      "[data-testid='currency-dropdown-list']",
    );
    expect(list).not.toBeNull();

    // AICSelect USD
    const options = list!.querySelectorAll("button[role='option']");
    const usdOption = Array.from(options).find((opt) =>
      opt.textContent?.includes("US Dollar"),
    );
    expect(usdOption).toBeDefined();

    fireEvent.click(usdOption!);

    // Trigger should now show $
    expect(trigger.textContent).toContain("$");
    expect(onCurrencyChange).toHaveBeenCalledWith(currencies[1]);
  });

  // ═══════════════════════════════════════════════════════════
  // 7. Focus shows raw editable number
  // ═══════════════════════════════════════════════════════════

  it("focus shows raw editable number", () => {
    const { container } = render(
      <AICCurrencyInput value={100000} locale="en-IN" decimals={0} />,
    );

    const input = container.querySelector(
      "[data-testid='currency-input']",
    ) as HTMLInputElement;

    // Before focus — formatted
    expect(input.value).toBe("1,00,000");

    // Focus — should show raw number
    fireEvent.focus(input);
    expect(input.value).toBe("100000");
  });

  // ═══════════════════════════════════════════════════════════
  // 8. Blur formats the display
  // ═══════════════════════════════════════════════════════════

  it("blur formats the display", () => {
    const { container } = render(
      <AICCurrencyInput value={50000} locale="en-US" decimals={2} />,
    );

    const input = container.querySelector(
      "[data-testid='currency-input']",
    ) as HTMLInputElement;

    // Focus — raw value
    fireEvent.focus(input);
    expect(input.value).toBe("50000");

    // Blur — formatted
    fireEvent.blur(input);
    expect(input.value).toBe("50,000.00");
  });
});
