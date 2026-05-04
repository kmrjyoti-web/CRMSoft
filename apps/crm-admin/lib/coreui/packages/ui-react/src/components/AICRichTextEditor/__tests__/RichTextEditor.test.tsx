/**
 * AICRichTextEditor component tests.
 * 13 test cases per P9.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICRichTextEditor } from "../AICRichTextEditor";
import { mergeEditorConfig, cleanEditorHtml } from "@coreui/ui";

// ── Mock document.execCommand ────────────────────────────
const mockExecCommand = vi.fn(() => true);

beforeEach(() => {
  mockExecCommand.mockClear();
  (document as any).execCommand = mockExecCommand;
});

describe("AICRichTextEditor", () => {
  // ── 1. Renders editor with contentEditable div ─────────
  it("renders editor with contentEditable div", () => {
    const { container } = render(<AICRichTextEditor />);

    const editorContent = container.querySelector(
      "[data-testid='editor-content']",
    ) as HTMLDivElement;
    expect(editorContent).toBeTruthy();
    expect(editorContent.getAttribute("contenteditable")).toBe("true");
  });

  // ── 2. Bold button executes bold command ───────────────
  it("bold button executes bold command", () => {
    const { container } = render(<AICRichTextEditor />);

    const boldBtn = container.querySelector(
      "[data-testid='editor-btn-bold']",
    ) as HTMLButtonElement;
    expect(boldBtn).toBeTruthy();

    fireEvent.click(boldBtn);
    expect(mockExecCommand).toHaveBeenCalledWith("bold", false, undefined);
  });

  // ── 3. Italic button executes italic command ───────────
  it("italic button executes italic command", () => {
    const { container } = render(<AICRichTextEditor />);

    const italicBtn = container.querySelector(
      "[data-testid='editor-btn-italic']",
    ) as HTMLButtonElement;
    expect(italicBtn).toBeTruthy();

    fireEvent.click(italicBtn);
    expect(mockExecCommand).toHaveBeenCalledWith("italic", false, undefined);
  });

  // ── 4. Underline button executes underline command ─────
  it("underline button executes underline command", () => {
    const { container } = render(<AICRichTextEditor />);

    const underlineBtn = container.querySelector(
      "[data-testid='editor-btn-underline']",
    ) as HTMLButtonElement;
    expect(underlineBtn).toBeTruthy();

    fireEvent.click(underlineBtn);
    expect(mockExecCommand).toHaveBeenCalledWith("underline", false, undefined);
  });

  // ── 5. Undo/redo buttons present when history enabled ──
  it("undo/redo buttons present when history enabled", () => {
    const { container } = render(<AICRichTextEditor />);

    const undoBtn = container.querySelector(
      "[data-testid='editor-btn-undo']",
    );
    const redoBtn = container.querySelector(
      "[data-testid='editor-btn-redo']",
    );
    expect(undoBtn).toBeTruthy();
    expect(redoBtn).toBeTruthy();

    // Verify they disappear when history is disabled
    const { container: container2 } = render(
      <AICRichTextEditor editorConfig={{ showToolbar: { history: false } as any }} />,
    );
    const undoBtn2 = container2.querySelector(
      "[data-testid='editor-btn-undo']",
    );
    expect(undoBtn2).toBeFalsy();
  });

  // ── 6. Code view toggles between editor and textarea ───
  it("code view toggles between editor and textarea", () => {
    const { container } = render(<AICRichTextEditor />);

    // Initially in visual mode
    expect(
      container.querySelector("[data-testid='editor-content']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='editor-code-textarea']"),
    ).toBeFalsy();

    // Click code view toggle
    const codeViewBtn = container.querySelector(
      "[data-testid='editor-btn-codeView']",
    ) as HTMLButtonElement;
    expect(codeViewBtn).toBeTruthy();
    fireEvent.click(codeViewBtn);

    // Now textarea should be visible
    expect(
      container.querySelector("[data-testid='editor-code-textarea']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='editor-content']"),
    ).toBeFalsy();

    // Toggle back
    fireEvent.click(codeViewBtn);
    expect(
      container.querySelector("[data-testid='editor-content']"),
    ).toBeTruthy();
  });

  // ── 7. Heading dropdown applies formatBlock ────────────
  it("heading dropdown applies formatBlock", () => {
    const { container } = render(<AICRichTextEditor />);

    const headingSelect = container.querySelector(
      "[data-testid='editor-select-headings']",
    ) as HTMLSelectElement;
    expect(headingSelect).toBeTruthy();

    fireEvent.change(headingSelect, { target: { value: "H1" } });
    expect(mockExecCommand).toHaveBeenCalledWith("formatBlock", false, "H1");
  });

  // ── 8. Font dropdown applies fontName ──────────────────
  it("font dropdown applies fontName", () => {
    const { container } = render(<AICRichTextEditor />);

    const fontSelect = container.querySelector(
      "[data-testid='editor-select-fonts']",
    ) as HTMLSelectElement;
    expect(fontSelect).toBeTruthy();

    fireEvent.change(fontSelect, { target: { value: "Georgia" } });
    expect(mockExecCommand).toHaveBeenCalledWith("fontName", false, "Georgia");
  });

  // ── 9. Font size dropdown applies fontSize ─────────────
  it("font size dropdown applies fontSize", () => {
    const { container } = render(<AICRichTextEditor />);

    const fontSizeSelect = container.querySelector(
      "[data-testid='editor-select-fontSizes']",
    ) as HTMLSelectElement;
    expect(fontSizeSelect).toBeTruthy();

    fireEvent.change(fontSizeSelect, { target: { value: "4" } });
    expect(mockExecCommand).toHaveBeenCalledWith("fontSize", false, "4");
  });

  // ── 10. onInput updates value ──────────────────────────
  it("onInput updates value", () => {
    const onChange = vi.fn();
    const { container } = render(<AICRichTextEditor onChange={onChange} />);

    const editorContent = container.querySelector(
      "[data-testid='editor-content']",
    ) as HTMLDivElement;

    // Simulate typing by setting innerHTML and firing input
    editorContent.innerHTML = "<p>Hello World</p>";
    fireEvent.input(editorContent);

    expect(onChange).toHaveBeenCalledWith("<p>Hello World</p>");
  });

  // ── 11. Label renders when provided ────────────────────
  it("label renders when provided", () => {
    const { container } = render(
      <AICRichTextEditor label="Description" required />,
    );

    const label = container.querySelector("label");
    expect(label).toBeTruthy();
    expect(label?.textContent).toContain("Description");
    expect(label?.textContent).toContain("*");
  });

  // ── 12. Error state displays error message ─────────────
  it("error state displays error message", () => {
    const { container } = render(
      <AICRichTextEditor error errorMessage="Content is required" />,
    );

    const errorEl = container.querySelector(
      "[data-testid='editor-error']",
    );
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toBe("Content is required");
  });

  // ── 13. Disabled state prevents editing ────────────────
  it("disabled state prevents editing", () => {
    const { container } = render(<AICRichTextEditor disabled />);

    const editorContent = container.querySelector(
      "[data-testid='editor-content']",
    ) as HTMLDivElement;
    expect(editorContent.getAttribute("contenteditable")).toBe("false");

    // Container should have disabled styling
    const editorContainer = container.querySelector(
      "[data-testid='editor-container']",
    );
    expect(editorContainer?.className).toContain("opacity-50");

    // Toolbar buttons should be disabled
    const boldBtn = container.querySelector(
      "[data-testid='editor-btn-bold']",
    ) as HTMLButtonElement;
    expect(boldBtn.disabled).toBe(true);
  });
});
