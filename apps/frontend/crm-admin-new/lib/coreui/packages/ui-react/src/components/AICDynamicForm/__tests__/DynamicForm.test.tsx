/**
 * AICDynamicForm component tests.
 * 8+ test cases covering title/description, standard layout,
 * tab navigation, tab switching, grid columns, validation,
 * reset, and onSubmit.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICDynamicForm } from "../AICDynamicForm";
import type { FormSchema } from "@coreui/ui";

// ── Test Helpers ────────────────────────────
const standardSchema: FormSchema = {
  title: "User Registration",
  description: "Please fill out all required fields",
  layout: "standard",
  rows: [
    {
      columns: [
        {
          span: "6",
          field: {
            key: "firstName",
            type: "text",
            label: "First Name",
            validators: { required: true },
          },
        },
        {
          span: "6",
          field: {
            key: "lastName",
            type: "text",
            label: "Last Name",
          },
        },
      ],
    },
    {
      columns: [
        {
          span: "12",
          field: {
            key: "email",
            type: "email",
            label: "Email",
            validators: { required: true },
          },
        },
      ],
    },
  ],
};

const tabSchema: FormSchema = {
  title: "Settings",
  description: "Configure your preferences",
  layout: "tabs",
  tabs: [
    {
      id: "general",
      label: "General",
      rows: [
        {
          columns: [
            {
              span: "12",
              field: {
                key: "displayName",
                type: "text",
                label: "Display Name",
              },
            },
          ],
        },
      ],
    },
    {
      id: "security",
      label: "Security",
      rows: [
        {
          columns: [
            {
              span: "12",
              field: {
                key: "password",
                type: "password",
                label: "Password",
                validators: { required: true },
              },
            },
          ],
        },
      ],
    },
    {
      id: "notifications",
      label: "Notifications",
      rows: [
        {
          columns: [
            {
              span: "12",
              field: {
                key: "emailNotifications",
                type: "checkbox",
                label: "Email Notifications",
              },
            },
          ],
        },
      ],
    },
  ],
};

describe("AICDynamicForm", () => {
  // ── 1. Renders form with title and description ──────────
  it("renders form with title and description", () => {
    const { container } = render(<AICDynamicForm schema={standardSchema} />);

    const title = container.querySelector("[data-testid='form-title']");
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe("User Registration");

    const description = container.querySelector("[data-testid='form-description']");
    expect(description).toBeTruthy();
    expect(description?.textContent).toBe("Please fill out all required fields");
  });

  // ── 2. Renders standard layout rows ─────────────────────
  it("renders standard layout rows", () => {
    const { container } = render(<AICDynamicForm schema={standardSchema} />);

    const form = container.querySelector("[data-testid='dynamic-form']");
    expect(form).toBeTruthy();

    const rows = container.querySelectorAll("[data-testid='form-row']");
    expect(rows.length).toBe(2);

    // First row should have 2 columns
    const firstRowCols = rows[0].querySelectorAll("[data-testid='form-column']");
    expect(firstRowCols.length).toBe(2);

    // Check that fields are rendered
    const firstNameInput = container.querySelector("[data-testid='input-firstName']");
    expect(firstNameInput).toBeTruthy();

    const emailInput = container.querySelector("[data-testid='input-email']");
    expect(emailInput).toBeTruthy();
  });

  // ── 3. Renders tab navigation for tab layout ────────────
  it("renders tab navigation for tab layout", () => {
    const { container } = render(<AICDynamicForm schema={tabSchema} />);

    const tabNav = container.querySelector("[data-testid='form-tab-nav']");
    expect(tabNav).toBeTruthy();

    const tabs = tabNav?.querySelectorAll("[role='tab']");
    expect(tabs?.length).toBe(3);
    expect(tabs?.[0].textContent).toContain("General");
    expect(tabs?.[1].textContent).toContain("Security");
    expect(tabs?.[2].textContent).toContain("Notifications");
  });

  // ── 4. Switches tabs on click ───────────────────────────
  it("switches tabs on click", () => {
    const { container } = render(<AICDynamicForm schema={tabSchema} />);

    // Initially, General tab is active showing "Display Name" field
    const displayNameInput = container.querySelector("[data-testid='input-displayName']");
    expect(displayNameInput).toBeTruthy();

    // Password field should NOT be visible (it's on Security tab)
    let passwordInput = container.querySelector("[data-testid='input-password']");
    expect(passwordInput).toBeNull();

    // Click Security tab
    const securityTab = container.querySelector("[data-testid='form-tab-security']") as HTMLElement;
    expect(securityTab).toBeTruthy();
    fireEvent.click(securityTab);

    // Now password field should be visible
    passwordInput = container.querySelector("[data-testid='input-password']");
    expect(passwordInput).toBeTruthy();

    // Display Name should NOT be visible
    const displayNameAfter = container.querySelector("[data-testid='input-displayName']");
    expect(displayNameAfter).toBeNull();
  });

  // ── 5. Renders fields within grid columns ───────────────
  it("renders fields within grid columns", () => {
    const { container } = render(<AICDynamicForm schema={standardSchema} />);

    const columns = container.querySelectorAll("[data-testid='form-column']");
    // 2 columns in first row + 1 column in second row = 3
    expect(columns.length).toBe(3);

    // Check that grid layout is applied
    const rows = container.querySelectorAll("[data-testid='form-row']");
    expect(rows[0].className).toContain("grid");
    expect(rows[0].className).toContain("grid-cols-12");
  });

  // ── 6. Submit validates required fields ─────────────────
  it("submit validates required fields", () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <AICDynamicForm schema={standardSchema} onSubmit={onSubmit} />,
    );

    // Submit without filling required fields
    const submitBtn = container.querySelector("[data-testid='form-submit']") as HTMLButtonElement;
    expect(submitBtn).toBeTruthy();
    fireEvent.click(submitBtn);

    // onSubmit should NOT be called because validation fails
    expect(onSubmit).not.toHaveBeenCalled();

    // Error messages should appear
    const firstNameError = container.querySelector("[data-testid='error-firstName']");
    expect(firstNameError).toBeTruthy();
    expect(firstNameError?.textContent).toContain("First Name is required");

    const emailError = container.querySelector("[data-testid='error-email']");
    expect(emailError).toBeTruthy();
    expect(emailError?.textContent).toContain("Email is required");
  });

  // ── 7. Reset clears form values ─────────────────────────
  it("reset clears form values", () => {
    const onReset = vi.fn();
    const { container } = render(
      <AICDynamicForm schema={standardSchema} onReset={onReset} />,
    );

    // Type something in firstName
    const firstNameInput = container.querySelector("[data-testid='input-firstName']") as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    expect(firstNameInput.value).toBe("John");

    // Click Reset
    const resetBtn = container.querySelector("[data-testid='form-reset']") as HTMLButtonElement;
    fireEvent.click(resetBtn);

    expect(onReset).toHaveBeenCalled();

    // Value should be reset to initial (empty string)
    expect(firstNameInput.value).toBe("");
  });

  // ── 8. Calls onSubmit with form values ──────────────────
  it("calls onSubmit with form values when validation passes", () => {
    const onSubmit = vi.fn();

    // Use a schema with no required fields
    const simpleSchema: FormSchema = {
      title: "Simple Form",
      rows: [
        {
          columns: [
            {
              span: "12",
              field: {
                key: "name",
                type: "text",
                label: "Name",
              },
            },
          ],
        },
      ],
    };

    const { container } = render(
      <AICDynamicForm schema={simpleSchema} onSubmit={onSubmit} />,
    );

    // Type a value
    const nameInput = container.querySelector("[data-testid='input-name']") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Alice" } });

    // Submit
    const submitBtn = container.querySelector("[data-testid='form-submit']") as HTMLButtonElement;
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Alice" }),
    );
  });

  // ── 9. Renders submit and reset buttons ─────────────────
  it("renders submit and reset buttons", () => {
    const { container } = render(<AICDynamicForm schema={standardSchema} />);

    const actions = container.querySelector("[data-testid='form-actions']");
    expect(actions).toBeTruthy();

    const submitBtn = container.querySelector("[data-testid='form-submit']");
    expect(submitBtn).toBeTruthy();
    expect(submitBtn?.textContent).toBe("Submit");

    const resetBtn = container.querySelector("[data-testid='form-reset']");
    expect(resetBtn).toBeTruthy();
    expect(resetBtn?.textContent).toBe("Reset");
  });

  // ── 10. Handles onChange callback ───────────────────────
  it("handles onChange callback", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICDynamicForm
        schema={standardSchema}
        values={{ firstName: "", lastName: "", email: "" }}
        onChange={onChange}
      />,
    );

    const firstNameInput = container.querySelector("[data-testid='input-firstName']") as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: "Bob" } });

    expect(onChange).toHaveBeenCalledWith("firstName", "Bob");
  });
});
