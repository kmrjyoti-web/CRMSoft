/**
 * AICMobileInput component tests.
 * 8 test cases per P2.5 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICMobileInput } from "../AICMobileInput";
import {
  COUNTRY_DATABASE,
  getPopularCountries,
  applyPhoneMask,
  filterCountries,
  validatePhoneNumber,
} from "@coreui/ui";

describe("AICMobileInput", () => {
  // ── 1. Default country code is +91 (India) ───────────────
  it("defaults to India (+91) country code", () => {
    const { container } = render(<AICMobileInput />);
    const trigger = container.querySelector("[data-testid='country-dropdown-trigger']");
    expect(trigger?.textContent).toContain("+91");
    expect(trigger?.textContent).toContain("🇮🇳");
  });

  // ── 2. Country dropdown shows flag + code ────────────────
  it("shows country dropdown with flags and dial codes", () => {
    const { container } = render(<AICMobileInput />);

    // Dropdown should be closed initially
    expect(container.querySelector("[data-testid='country-dropdown-list']")).toBeNull();

    // Open dropdown
    const trigger = container.querySelector("[data-testid='country-dropdown-trigger']") as HTMLButtonElement;
    fireEvent.click(trigger);
    const list = container.querySelector("[data-testid='country-dropdown-list']");
    expect(list).toBeTruthy();

    // Verify India option exists
    const indiaOption = container.querySelector("[data-testid='country-option-IN']");
    expect(indiaOption?.textContent).toContain("🇮🇳");
    expect(indiaOption?.textContent).toContain("India");
    expect(indiaOption?.textContent).toContain("+91");

    // Verify US option exists
    const usOption = container.querySelector("[data-testid='country-option-US']");
    expect(usOption?.textContent).toContain("🇺🇸");
    expect(usOption?.textContent).toContain("+1");
  });

  // ── 3. Search filters country list ────────────────────────
  it("filters countries by search term", () => {
    // Test the pure logic function
    const results = filterCountries(COUNTRY_DATABASE, "japan");
    expect(results.length).toBe(1);
    expect(results[0].code).toBe("JP");

    // Filter by dial code
    const byDial = filterCountries(COUNTRY_DATABASE, "+44");
    expect(byDial.some((c) => c.code === "GB")).toBe(true);

    // Filter by country code
    const byCode = filterCountries(COUNTRY_DATABASE, "us");
    expect(byCode.some((c) => c.code === "US")).toBe(true);
  });

  // ── 4. Validates 10-digit Indian number ──────────────────
  it("validates 10-digit Indian phone number", () => {
    const india = COUNTRY_DATABASE.find((c) => c.code === "IN")!;

    // Complete number — no error
    expect(validatePhoneNumber("9876543210", india)).toBeNull();

    // Incomplete number — error
    expect(validatePhoneNumber("98765", india)).toBe(
      "Phone number must be 10 digits",
    );
  });

  // ── 5. Validates US number format ────────────────────────
  it("formats US phone number correctly", () => {
    const us = COUNTRY_DATABASE.find((c) => c.code === "US")!;
    const formatted = applyPhoneMask("2125551234", us.mask);
    expect(formatted).toBe("(212) 555-1234");
  });

  // ── 6. Rejects incomplete number ─────────────────────────
  it("rejects incomplete phone number with validation error", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICMobileInput onChange={onChange} id="phone" />,
    );

    const input = container.querySelector(
      "input[data-testid='mobile-input']",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    // Type partial number
    fireEvent.change(input, { target: { value: "98765" } });

    // Should show validation error for incomplete
    const errorEl = container.querySelector("[role='alert']");
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toContain("10 digits");
  });

  // ── 7. Selecting new country changes formatting ──────────
  it("reformats phone number when country changes", () => {
    const onCountryChange = vi.fn();
    const { container } = render(
      <AICMobileInput onCountryChange={onCountryChange} />,
    );

    const input = container.querySelector(
      "input[data-testid='mobile-input']",
    ) as HTMLInputElement;

    // Type a number (India format)
    fireEvent.change(input, { target: { value: "9876543210" } });
    expect(input.value).toBe("98765-43210");

    // Open dropdown and select US
    const trigger = container.querySelector("[data-testid='country-dropdown-trigger']") as HTMLButtonElement;
    fireEvent.click(trigger);
    const usOption = container.querySelector("[data-testid='country-option-US']") as HTMLButtonElement;
    fireEvent.click(usOption);

    // Number should be reformatted with US mask (truncated to 10 digits)
    expect(input.value).toBe("(987) 654-3210");
    expect(onCountryChange).toHaveBeenCalledWith(
      expect.objectContaining({ code: "US", dialCode: "+1" }),
    );
  });

  // ── 8. Popular countries appear first in list ────────────
  it("pins popular countries at the top of the list", () => {
    const popular = getPopularCountries(COUNTRY_DATABASE);
    expect(popular.length).toBe(7);

    // Verify specific popular countries
    const popularCodes = popular.map((c) => c.code);
    expect(popularCodes).toContain("IN");
    expect(popularCodes).toContain("US");
    expect(popularCodes).toContain("GB");
    expect(popularCodes).toContain("CA");
    expect(popularCodes).toContain("AU");
    expect(popularCodes).toContain("AE");
    expect(popularCodes).toContain("SG");
  });
});
