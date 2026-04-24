/**
 * AICFileUpload component tests.
 * 8 test cases per P8.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { AICFileUpload } from "../AICFileUpload";
import { isImageFile, isImageDataUrl, formatFileSize } from "@coreui/ui";
import type { FileData } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockFile(
  name: string,
  size: number,
  type: string,
): File {
  const content = new Array(size).fill("a").join("");
  return new File([content], name, { type });
}

const mockImageFileData: FileData = {
  name: "photo.png",
  size: 1024,
  type: "image/png",
  data: "data:image/png;base64,abc123",
};

const mockDocFileData: FileData = {
  name: "document.pdf",
  size: 2048,
  type: "application/pdf",
  data: "data:application/pdf;base64,xyz789",
};

describe("AICFileUpload", () => {
  // ── 1. Renders dropzone with empty state ──────────────
  it("renders dropzone with empty state", () => {
    const { container } = render(<AICFileUpload />);

    const dropzone = container.querySelector(
      "[data-testid='file-upload-dropzone']",
    ) as HTMLElement;
    expect(dropzone).toBeTruthy();

    const emptyState = container.querySelector(
      "[data-testid='file-upload-empty']",
    ) as HTMLElement;
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain("Click to upload");
    expect(emptyState.textContent).toContain("drag and drop");
  });

  // ── 2. File selection updates preview ─────────────────
  it("file selection updates preview", async () => {
    const onChange = vi.fn();
    const { container } = render(<AICFileUpload onChange={onChange} />);

    const input = container.querySelector(
      "[data-testid='file-upload-input']",
    ) as HTMLInputElement;

    const file = createMockFile("test.txt", 100, "text/plain");
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const fileData = onChange.mock.calls[0][0] as FileData;
    expect(fileData.name).toBe("test.txt");
    expect(fileData.size).toBe(100);
    expect(fileData.type).toBe("text/plain");
  });

  // ── 3. Image file shows image preview ─────────────────
  it("image file shows image preview", () => {
    // Pure logic tests
    expect(isImageFile("image/png")).toBe(true);
    expect(isImageFile("image/jpeg")).toBe(true);
    expect(isImageFile("application/pdf")).toBe(false);
    expect(isImageDataUrl("data:image/png;base64,abc")).toBe(true);
    expect(isImageDataUrl("data:application/pdf;base64,xyz")).toBe(false);

    // Component test
    const { container } = render(
      <AICFileUpload value={mockImageFileData} />,
    );

    const imagePreview = container.querySelector(
      "[data-testid='file-upload-image-preview']",
    ) as HTMLImageElement;
    expect(imagePreview).toBeTruthy();
    expect(imagePreview.src).toContain("data:image/png");
  });

  // ── 4. Non-image file shows file icon ─────────────────
  it("non-image file shows file icon", () => {
    const { container } = render(
      <AICFileUpload value={mockDocFileData} />,
    );

    const fileIcon = container.querySelector(
      "[data-testid='file-upload-file-icon']",
    ) as HTMLElement;
    expect(fileIcon).toBeTruthy();
    expect(fileIcon.textContent).toContain("document.pdf");

    // Should NOT show image preview
    const imagePreview = container.querySelector(
      "[data-testid='file-upload-image-preview']",
    );
    expect(imagePreview).toBeNull();
  });

  // ── 5. Drag and drop sets file ────────────────────────
  it("drag and drop sets file", async () => {
    const onChange = vi.fn();
    const { container } = render(<AICFileUpload onChange={onChange} />);

    const dropzone = container.querySelector(
      "[data-testid='file-upload-dropzone']",
    ) as HTMLElement;

    const file = createMockFile("dropped.png", 500, "image/png");

    // Simulate dragover
    fireEvent.dragOver(dropzone, {
      dataTransfer: { files: [file] },
    });

    // Simulate drop
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const fileData = onChange.mock.calls[0][0] as FileData;
    expect(fileData.name).toBe("dropped.png");
  });

  // ── 6. Remove button clears file ──────────────────────
  it("remove button clears file", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICFileUpload value={mockImageFileData} onChange={onChange} />,
    );

    // Preview should be visible
    const preview = container.querySelector(
      "[data-testid='file-upload-preview']",
    );
    expect(preview).toBeTruthy();

    // Click remove
    const removeBtn = container.querySelector(
      "[data-testid='file-upload-remove']",
    ) as HTMLElement;
    expect(removeBtn).toBeTruthy();
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  // ── 7. Accept attribute applied to input ──────────────
  it("accept attribute applied to input", () => {
    // Pure logic test
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1048576)).toBe("1.0 MB");
    expect(formatFileSize(1572864)).toBe("1.5 MB");

    // Component test
    const { container } = render(
      <AICFileUpload accept="image/*,.pdf" maxSize="5MB" />,
    );

    const input = container.querySelector(
      "[data-testid='file-upload-input']",
    ) as HTMLInputElement;
    expect(input.accept).toBe("image/*,.pdf");

    // Accept info should be shown in dropzone
    const emptyState = container.querySelector(
      "[data-testid='file-upload-empty']",
    ) as HTMLElement;
    expect(emptyState.textContent).toContain("image/*,.pdf");
    expect(emptyState.textContent).toContain("Max 5MB");
  });

  // ── 8. onChange fires with FileData ───────────────────
  it("onChange fires with FileData", async () => {
    const onChange = vi.fn();
    const { container } = render(<AICFileUpload onChange={onChange} />);

    const input = container.querySelector(
      "[data-testid='file-upload-input']",
    ) as HTMLInputElement;

    const file = createMockFile("report.pdf", 2048, "application/pdf");
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    const fileData = onChange.mock.calls[0][0] as FileData;
    expect(fileData).toHaveProperty("name", "report.pdf");
    expect(fileData).toHaveProperty("size", 2048);
    expect(fileData).toHaveProperty("type", "application/pdf");
    expect(fileData).toHaveProperty("data");
    expect(typeof fileData.data).toBe("string");
  });
});
