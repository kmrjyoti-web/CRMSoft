/**
 * AICSchemaBuilder & AICFieldEditor tests.
 * 8+ test cases covering upload, preview, field selection, and editing.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICSchemaBuilder } from "../AICSchemaBuilder";

import type { FormSchema } from "@coreui/ui";

// ── Helpers ─────────────────────────────────────────────

const mockSchema: FormSchema = {
  title: "Test Form",
  description: "A test form schema",
  layout: "standard",
  rows: [
    {
      columns: [
        {
          span: "col-6",
          field: {
            key: "first_name",
            type: "text",
            label: "First Name",
            placeholder: "Enter first name",
            validators: { required: true },
          },
        },
        {
          span: "col-6",
          field: {
            key: "last_name",
            type: "text",
            label: "Last Name",
            placeholder: "Enter last name",
          },
        },
      ],
    },
    {
      columns: [
        {
          span: "col-12",
          field: {
            key: "email",
            type: "email",
            label: "Email Address",
            placeholder: "user@example.com",
            validators: { required: true, email: true },
          },
        },
      ],
    },
  ],
};

const tabbedSchema: FormSchema = {
  title: "Tabbed Form",
  description: "A tabbed form schema",
  layout: "tabs",
  rows: [
    {
      columns: [
        {
          span: "col-12",
          field: {
            key: "header_field",
            type: "text",
            label: "Header Field",
          },
        },
      ],
    },
  ],
  tabs: [
    {
      id: "personal",
      label: "Personal Info",
      rows: [
        {
          columns: [
            {
              span: "col-6",
              field: {
                key: "tab_name",
                type: "text",
                label: "Name",
              },
            },
          ],
        },
      ],
    },
    {
      id: "contact",
      label: "Contact Info",
      rows: [],
    },
  ],
};

// ── Tests ───────────────────────────────────────────────

describe("AICSchemaBuilder", () => {
  // ── 1. Renders in upload mode when no schema ──────────
  it("renders in upload mode when no schema", () => {
    const { container } = render(<AICSchemaBuilder />);

    const builder = container.querySelector("[data-testid='schema-builder']");
    expect(builder).toBeTruthy();

    const uploadState = container.querySelector("[data-testid='upload-state']");
    expect(uploadState).toBeTruthy();

    const modeBadge = container.querySelector("[data-testid='mode-badge']");
    expect(modeBadge).toBeTruthy();
    expect(modeBadge?.textContent).toBe("Upload");
  });

  // ── 2. Shows mode toggle (Single Page / Tabbed View) ──
  it("shows mode toggle with Single Page and Tabbed View options", () => {
    const { container } = render(<AICSchemaBuilder />);

    const modeToggle = container.querySelector("[data-testid='mode-toggle']");
    expect(modeToggle).toBeTruthy();

    const singlePageBtn = container.querySelector("[data-testid='mode-single-page']");
    expect(singlePageBtn).toBeTruthy();
    expect(singlePageBtn?.textContent).toBe("Single Page");

    const tabbedViewBtn = container.querySelector("[data-testid='mode-tabbed-view']");
    expect(tabbedViewBtn).toBeTruthy();
    expect(tabbedViewBtn?.textContent).toBe("Tabbed View");
  });

  // ── 3. Renders file upload area ───────────────────────
  it("renders file upload area", () => {
    const { container } = render(<AICSchemaBuilder />);

    const fileUploadArea = container.querySelector("[data-testid='file-upload-area']");
    expect(fileUploadArea).toBeTruthy();

    const fileInput = container.querySelector("[data-testid='file-input']");
    expect(fileInput).toBeTruthy();
    expect(fileInput?.getAttribute("type")).toBe("file");
    expect(fileInput?.getAttribute("accept")).toBe("image/*");
  });

  // ── 4. Renders HTML paste area ────────────────────────
  it("renders HTML paste area with textarea and generate button", () => {
    const { container } = render(<AICSchemaBuilder />);

    const htmlPasteArea = container.querySelector("[data-testid='html-paste-area']");
    expect(htmlPasteArea).toBeTruthy();

    const htmlInput = container.querySelector("[data-testid='html-input']") as HTMLTextAreaElement;
    expect(htmlInput).toBeTruthy();

    const generateBtn = container.querySelector("[data-testid='generate-html-btn']") as HTMLButtonElement;
    expect(generateBtn).toBeTruthy();
    expect(generateBtn.textContent).toBe("Generate from HTML");
    expect(generateBtn.disabled).toBe(true);

    // Type some HTML to enable button
    fireEvent.change(htmlInput, { target: { value: "<form><input /></form>" } });
    expect(
      (container.querySelector("[data-testid='generate-html-btn']") as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  // ── 5. Shows loading overlay when loading ─────────────
  it("shows loading overlay during AI generation", async () => {
    let resolveGeneration: (schema: FormSchema) => void;
    const generatePromise = new Promise<FormSchema>((resolve) => {
      resolveGeneration = resolve;
    });

    const onGenerateFromHtml = vi.fn(() => generatePromise);

    const { container } = render(
      <AICSchemaBuilder onGenerateFromHtml={onGenerateFromHtml} />,
    );

    // Type HTML and click generate
    const htmlInput = container.querySelector("[data-testid='html-input']") as HTMLTextAreaElement;
    fireEvent.change(htmlInput, { target: { value: "<form>test</form>" } });

    const generateBtn = container.querySelector("[data-testid='generate-html-btn']") as HTMLButtonElement;
    fireEvent.click(generateBtn);

    // Loading overlay should appear
    const loadingOverlay = container.querySelector("[data-testid='loading-overlay']");
    expect(loadingOverlay).toBeTruthy();

    const spinner = container.querySelector("[data-testid='loading-spinner']");
    expect(spinner).toBeTruthy();

    // Resolve the promise to clean up
    resolveGeneration!(mockSchema);
  });

  // ── 6. Renders preview when schema provided ───────────
  it("renders preview when schema is provided", () => {
    const { container } = render(
      <AICSchemaBuilder initialSchema={mockSchema} />,
    );

    const previewState = container.querySelector("[data-testid='preview-state']");
    expect(previewState).toBeTruthy();

    const previewTitle = container.querySelector("[data-testid='preview-title']");
    expect(previewTitle?.textContent).toBe("Test Form");

    const previewDescription = container.querySelector("[data-testid='preview-description']");
    expect(previewDescription?.textContent).toBe("A test form schema");

    const modeBadge = container.querySelector("[data-testid='mode-badge']");
    expect(modeBadge?.textContent).toBe("Edit");

    // Check that fields are rendered
    const firstNameField = container.querySelector("[data-testid='field-wrapper-first_name']");
    expect(firstNameField).toBeTruthy();

    const lastNameField = container.querySelector("[data-testid='field-wrapper-last_name']");
    expect(lastNameField).toBeTruthy();

    const emailField = container.querySelector("[data-testid='field-wrapper-email']");
    expect(emailField).toBeTruthy();

    // Download and Reset buttons should be visible
    const downloadBtn = container.querySelector("[data-testid='download-btn']");
    expect(downloadBtn).toBeTruthy();

    const resetBtn = container.querySelector("[data-testid='reset-btn']");
    expect(resetBtn).toBeTruthy();
  });

  // ── 7. Field selection highlights field ───────────────
  it("field selection highlights the selected field", () => {
    const { container } = render(
      <AICSchemaBuilder initialSchema={mockSchema} />,
    );

    const firstNameField = container.querySelector(
      "[data-testid='field-wrapper-first_name']",
    ) as HTMLElement;
    expect(firstNameField).toBeTruthy();

    // Click to select
    fireEvent.click(firstNameField);

    // Should have ring-2 ring-primary classes (indicating selection)
    expect(firstNameField.className).toContain("ring-2");
    expect(firstNameField.className).toContain("ring-primary");

    // Click again to deselect
    fireEvent.click(firstNameField);
    expect(firstNameField.className).not.toContain("ring-primary");
  });

  // ── 8. AICFieldEditor shows field properties ─────────────
  it("AICFieldEditor shows field properties when field is selected", () => {
    const { container } = render(
      <AICSchemaBuilder initialSchema={mockSchema} />,
    );

    // Initially, editor should show placeholder
    const placeholder = container.querySelector("[data-testid='field-editor-placeholder']");
    expect(placeholder).toBeTruthy();

    // AICSelect the first_name field
    const firstNameField = container.querySelector(
      "[data-testid='field-wrapper-first_name']",
    ) as HTMLElement;
    fireEvent.click(firstNameField);

    // Editor form should now be visible
    const editorForm = container.querySelector("[data-testid='field-editor-form']");
    expect(editorForm).toBeTruthy();

    // Check that field properties are populated
    const keyInput = container.querySelector("[data-testid='field-key-input']") as HTMLInputElement;
    expect(keyInput.value).toBe("first_name");

    const labelInput = container.querySelector("[data-testid='field-label-input']") as HTMLInputElement;
    expect(labelInput.value).toBe("First Name");

    const typeSelect = container.querySelector("[data-testid='field-type-select']") as HTMLSelectElement;
    expect(typeSelect.value).toBe("text");

    const placeholderInput = container.querySelector("[data-testid='field-placeholder-input']") as HTMLInputElement;
    expect(placeholderInput.value).toBe("Enter first name");

    const requiredCheckbox = container.querySelector("[data-testid='field-required-checkbox']") as HTMLInputElement;
    expect(requiredCheckbox.checked).toBe(true);
  });

  // ── 9. Tabbed schema renders header rows and tabs ─────
  it("renders header rows and tab navigation for tabbed schema", () => {
    const { container } = render(
      <AICSchemaBuilder initialSchema={tabbedSchema} />,
    );

    // Header section should be visible
    const headerSection = container.querySelector("[data-testid='header-section']");
    expect(headerSection).toBeTruthy();

    // Tab navigation should be visible
    const tabNav = container.querySelector("[data-testid='tab-navigation']");
    expect(tabNav).toBeTruthy();

    const personalTab = container.querySelector("[data-testid='tab-personal']");
    expect(personalTab?.textContent).toBe("Personal Info");

    const contactTab = container.querySelector("[data-testid='tab-contact']");
    expect(contactTab?.textContent).toBe("Contact Info");
  });

  // ── 10. Reset clears the schema ───────────────────────
  it("reset button clears the schema and returns to upload mode", () => {
    const { container } = render(
      <AICSchemaBuilder initialSchema={mockSchema} />,
    );

    // Verify we are in preview mode
    expect(container.querySelector("[data-testid='preview-state']")).toBeTruthy();

    // Click reset
    const resetBtn = container.querySelector("[data-testid='reset-btn']") as HTMLButtonElement;
    fireEvent.click(resetBtn);

    // Should be back in upload mode
    expect(container.querySelector("[data-testid='upload-state']")).toBeTruthy();
    expect(container.querySelector("[data-testid='preview-state']")).toBeNull();
  });
});
