/**
 * AICDynamicField component tests.
 * 8+ test cases covering text input, textarea, select, checkbox,
 * unknown type, required indicator, fieldset, and onChange.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICDynamicField } from "../AICDynamicField";
import type { FormFieldConfig } from "@coreui/ui";

describe("AICDynamicField", () => {
  // ── 1. Renders text input with label ────────────────────
  it("renders text input with label", () => {
    const field: FormFieldConfig = {
      key: "firstName",
      type: "text",
      label: "First Name",
      placeholder: "Enter first name",
    };

    const { container } = render(<AICDynamicField field={field} value="" />);

    const label = container.querySelector("[data-testid='label-firstName']");
    expect(label).toBeTruthy();
    expect(label?.textContent).toContain("First Name");

    const input = container.querySelector("[data-testid='input-firstName']") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe("text");
    expect(input.placeholder).toBe("Enter first name");
  });

  // ── 2. Renders textarea for textarea type ───────────────
  it("renders textarea for textarea type", () => {
    const field: FormFieldConfig = {
      key: "bio",
      type: "textarea",
      label: "Biography",
      placeholder: "Tell us about yourself",
    };

    const { container } = render(<AICDynamicField field={field} value="" />);

    const textarea = container.querySelector("[data-testid='textarea-bio']") as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.tagName.toLowerCase()).toBe("textarea");
    expect(textarea.placeholder).toBe("Tell us about yourself");
  });

  // ── 3. Renders select with options ──────────────────────
  it("renders select with options", () => {
    const field: FormFieldConfig = {
      key: "country",
      type: "select",
      label: "Country",
      placeholder: "Choose country",
      options: [
        { label: "USA", value: "us" },
        { label: "India", value: "in" },
        { label: "UK", value: "uk" },
      ],
    };

    const { container } = render(<AICDynamicField field={field} value="" />);

    const select = container.querySelector("[data-testid='select-country']") as HTMLSelectElement;
    expect(select).toBeTruthy();

    // 3 options + 1 placeholder = 4
    const options = select.querySelectorAll("option");
    expect(options.length).toBe(4);
    expect(options[0].textContent).toBe("Choose country");
    expect(options[1].textContent).toBe("USA");
    expect(options[2].textContent).toBe("India");
    expect(options[3].textContent).toBe("UK");
  });

  // ── 4. Renders checkbox input ───────────────────────────
  it("renders checkbox input", () => {
    const field: FormFieldConfig = {
      key: "agree",
      type: "checkbox",
      label: "I agree to terms",
    };

    const { container } = render(<AICDynamicField field={field} value={false} />);

    const checkbox = container.querySelector("[data-testid='checkbox-agree']") as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.type).toBe("checkbox");
    expect(checkbox.checked).toBe(false);
  });

  // ── 5. Renders unknown type error ──────────────────────
  it("renders unknown type error", () => {
    const field = {
      key: "mystery",
      type: "nonexistent-type" as never,
      label: "Mystery Field",
    } as FormFieldConfig;

    const { container } = render(<AICDynamicField field={field} value="" />);

    const errorDiv = container.querySelector("[data-testid='unknown-field-mystery']");
    expect(errorDiv).toBeTruthy();
    expect(errorDiv?.textContent).toContain("Unknown control type:");
    expect(errorDiv?.textContent).toContain("nonexistent-type");
  });

  // ── 6. Shows required indicator ────────────────────────
  it("shows required indicator for required fields", () => {
    const field: FormFieldConfig = {
      key: "email",
      type: "email",
      label: "Email",
      validators: { required: true },
    };

    const { container } = render(<AICDynamicField field={field} value="" />);

    const requiredIndicator = container.querySelector("[data-testid='required-email']");
    expect(requiredIndicator).toBeTruthy();
    expect(requiredIndicator?.textContent).toBe("*");
  });

  // ── 7. AICFieldset renders with nested fields ─────────────
  it("fieldset renders with nested fields", () => {
    const field: FormFieldConfig = {
      key: "address",
      type: "fieldset",
      label: "Address",
      props: {
        appearance: "panel",
        rows: [
          {
            columns: [
              {
                span: "6",
                field: {
                  key: "city",
                  type: "text",
                  label: "City",
                },
              },
              {
                span: "6",
                field: {
                  key: "zip",
                  type: "text",
                  label: "ZIP Code",
                },
              },
            ],
          },
        ],
      },
    };

    const { container } = render(
      <AICDynamicField
        field={field}
        value={{ city: "Mumbai", zip: "400001" }}
      />,
    );

    const fieldset = container.querySelector("[data-testid='fieldset-address']");
    expect(fieldset).toBeTruthy();

    const legend = container.querySelector("[data-testid='fieldset-legend-address']");
    expect(legend).toBeTruthy();
    expect(legend?.textContent).toBe("Address");

    const content = container.querySelector("[data-testid='fieldset-content-address']");
    expect(content).toBeTruthy();

    // Nested fields should be rendered
    const cityInput = container.querySelector("[data-testid='input-city']");
    expect(cityInput).toBeTruthy();

    const zipInput = container.querySelector("[data-testid='input-zip']");
    expect(zipInput).toBeTruthy();
  });

  // ── 8. Calls onChange when input changes ────────────────
  it("calls onChange when input changes", () => {
    const onChange = vi.fn();
    const field: FormFieldConfig = {
      key: "username",
      type: "text",
      label: "Username",
    };

    const { container } = render(
      <AICDynamicField field={field} value="" onChange={onChange} />,
    );

    const input = container.querySelector("[data-testid='input-username']") as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { value: "john_doe" } });
    expect(onChange).toHaveBeenCalledWith("username", "john_doe");
  });

  // ── 9. Renders rating field ─────────────────────────────
  it("renders rating field with stars", () => {
    const onChange = vi.fn();
    const field: FormFieldConfig = {
      key: "stars",
      type: "rating",
      label: "AICRating",
      props: { max: 5 },
    };

    const { container } = render(
      <AICDynamicField field={field} value={3} onChange={onChange} />,
    );

    const rating = container.querySelector("[data-testid='rating-stars']");
    expect(rating).toBeTruthy();

    const starButtons = container.querySelectorAll("[data-testid^='rating-star-stars-']");
    expect(starButtons.length).toBe(5);

    // Click star 4
    fireEvent.click(starButtons[3]);
    expect(onChange).toHaveBeenCalledWith("stars", 4);
  });

  // ── 10. Hides field when hidden is true ─────────────────
  it("hides field when hidden is true", () => {
    const field: FormFieldConfig = {
      key: "secret",
      type: "text",
      label: "Secret Field",
      hidden: true,
    };

    const { container } = render(<AICDynamicField field={field} value="" />);

    const fieldEl = container.querySelector("[data-testid='dynamic-field-secret']");
    expect(fieldEl).toBeNull();
  });

  // ── 11. Shows validation error message ──────────────────
  it("shows validation error message", () => {
    const field: FormFieldConfig = {
      key: "name",
      type: "text",
      label: "Name",
    };

    const errors = { name: "Name is required" };

    const { container } = render(
      <AICDynamicField field={field} value="" errors={errors} />,
    );

    const errorEl = container.querySelector("[data-testid='error-name']");
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toBe("Name is required");
  });

  // ── 12. Renders date input ──────────────────────────────
  it("renders date input", () => {
    const field: FormFieldConfig = {
      key: "dob",
      type: "date",
      label: "Date of Birth",
    };

    const { container } = render(<AICDynamicField field={field} value="2000-01-01" />);

    const dateInput = container.querySelector("[data-testid='date-dob']") as HTMLInputElement;
    expect(dateInput).toBeTruthy();
    expect(dateInput.type).toBe("date");
    expect(dateInput.value).toBe("2000-01-01");
  });
});
