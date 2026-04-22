/**
 * AICSignature component tests.
 * 6 test cases per P8.2 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICSignature } from "../AICSignature";
import { getCanvasCoords, clearCanvas, canvasToDataUrl } from "@coreui/ui";

// ── Mock canvas context ──────────────────────────────────
const mockCtx = {
  lineWidth: 0,
  lineCap: "",
  strokeStyle: "",
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
};

beforeEach(() => {
  // Mock canvas getContext
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx as any);
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,mock");

  // Mock ResizeObserver
  (globalThis as any).ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

describe("AICSignature", () => {
  // ── 1. Renders canvas element ──────────────────────────
  it("renders canvas element", () => {
    const { container } = render(<AICSignature />);

    const canvas = container.querySelector(
      "[data-testid='signature-canvas']",
    ) as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
    expect(canvas.tagName).toBe("CANVAS");

    // Help text present
    const help = container.querySelector(
      "[data-testid='signature-help']",
    );
    expect(help?.textContent).toContain("Sign above inside the box.");
  });

  // ── 2. Clear button resets canvas ──────────────────────
  it("clear button resets canvas", () => {
    const onChange = vi.fn();
    const { container } = render(<AICSignature onChange={onChange} />);

    const clearBtn = container.querySelector(
      "[data-testid='signature-clear-btn']",
    ) as HTMLButtonElement;
    expect(clearBtn).toBeTruthy();

    fireEvent.click(clearBtn);
    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  // ── 3. Mousedown starts drawing ────────────────────────
  it("mousedown starts drawing (check isDrawing via save behavior)", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSignature width={400} height={200} onChange={onChange} />,
    );

    const canvas = container.querySelector(
      "[data-testid='signature-canvas']",
    ) as HTMLCanvasElement;

    // Simulate mousedown
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.moveTo).toHaveBeenCalled();

    // Simulate mousemove to draw
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    expect(mockCtx.lineTo).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();

    // Simulate mouseup to stop and save
    fireEvent.mouseUp(canvas);
    expect(onChange).toHaveBeenCalledWith("data:image/png;base64,mock");
  });

  // ── 4. Touch events supported ──────────────────────────
  it("touch events supported", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSignature width={400} height={200} onChange={onChange} />,
    );

    const canvas = container.querySelector(
      "[data-testid='signature-canvas']",
    ) as HTMLCanvasElement;

    // Simulate touchstart
    fireEvent.touchStart(canvas, {
      touches: [{ clientX: 50, clientY: 50 }],
    });
    expect(mockCtx.beginPath).toHaveBeenCalled();

    // Simulate touchmove
    fireEvent.touchMove(canvas, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    expect(mockCtx.lineTo).toHaveBeenCalled();

    // Simulate touchend to stop and save
    fireEvent.touchEnd(canvas);
    expect(onChange).toHaveBeenCalledWith("data:image/png;base64,mock");
  });

  // ── 5. onChange fires with dataUrl on stop drawing ─────
  it("onChange fires with dataUrl on stop drawing", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSignature width={400} height={200} onChange={onChange} />,
    );

    const canvas = container.querySelector(
      "[data-testid='signature-canvas']",
    ) as HTMLCanvasElement;

    // Draw a stroke
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(canvas);

    expect(onChange).toHaveBeenCalledTimes(1);
    const dataUrl = onChange.mock.calls[0][0];
    expect(typeof dataUrl).toBe("string");
    expect(dataUrl).toContain("data:image/png");
  });

  // ── 6. Disabled state prevents drawing ─────────────────
  it("disabled state prevents drawing", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSignature width={400} height={200} disabled onChange={onChange} />,
    );

    const canvas = container.querySelector(
      "[data-testid='signature-canvas']",
    ) as HTMLCanvasElement;

    // Attempt to draw while disabled
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(canvas);

    // onChange should not fire
    expect(onChange).not.toHaveBeenCalled();

    // Clear button should not be present when disabled
    const clearBtn = container.querySelector(
      "[data-testid='signature-clear-btn']",
    );
    expect(clearBtn).toBeFalsy();
  });
});
