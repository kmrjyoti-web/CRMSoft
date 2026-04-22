/**
 * React AICSignature component.
 * Canvas-based signature pad with mouse and touch event support,
 * clear button, responsive width, and load-existing-value capability.
 *
 * Source: Angular signature.component.ts
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  cn,
  getCanvasCoords,
  initCanvasContext,
  clearCanvas,
  canvasToDataUrl,
  loadImageToCanvas,
  GLOBAL_UI_CONFIG,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SignatureProps {
  value?: string | null;
  defaultValue?: string | null;
  label?: string;
  width?: number;
  height?: number;
  lineWidth?: number;
  lineColor?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  id?: string;
  onChange?: (dataUrl: string | null) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICSignature = React.forwardRef<HTMLDivElement, SignatureProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = null,
      label,
      width: propWidth,
      height = 200,
      lineWidth = 2,
      lineColor = "#000",
      disabled = false,
      required = false,
      error = false,
      errorMessage,
      className,
      id,
      onChange,
    } = props;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string | null>(
      defaultValue,
    );
    const currentValue = isControlled ? controlledValue : internalValue;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawingRef = useRef(false);
    const [canvasWidth, setCanvasWidth] = useState(propWidth ?? 0);

    // ── Responsive width ──────────────────────────────────
    useEffect(() => {
      if (propWidth) {
        setCanvasWidth(propWidth);
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const updateWidth = () => {
        setCanvasWidth(container.clientWidth);
      };
      updateWidth();

      const observer = new ResizeObserver(updateWidth);
      observer.observe(container);
      return () => observer.disconnect();
    }, [propWidth]);

    // ── Init canvas context ───────────────────────────────
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      initCanvasContext(ctx, lineWidth, lineColor);
    }, [lineWidth, lineColor, canvasWidth, height]);

    // ── Load existing value ───────────────────────────────
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !currentValue) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      loadImageToCanvas(ctx, currentValue);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Drawing handlers ──────────────────────────────────
    const startDrawing = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        isDrawingRef.current = true;
        const coords = getCanvasCoords(event.nativeEvent, canvas);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      },
      [disabled],
    );

    const draw = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingRef.current || disabled) return;
        event.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const coords = getCanvasCoords(event.nativeEvent, canvas);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      },
      [disabled],
    );

    const stopDrawing = useCallback(() => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const dataUrl = canvasToDataUrl(canvas);
      if (!isControlled) {
        setInternalValue(dataUrl);
      }
      onChange?.(dataUrl);
    }, [isControlled, onChange]);

    // ── Clear handler ─────────────────────────────────────
    const handleClear = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      clearCanvas(ctx, canvas.width, canvas.height);
      initCanvasContext(ctx, lineWidth, lineColor);

      if (!isControlled) {
        setInternalValue(null);
      }
      onChange?.(null);
    }, [isControlled, lineWidth, lineColor, onChange]);

    return (
      <div
        className={cn("relative", className)}
        ref={ref}
        data-testid="signature"
      >
        {label && (
          <label
            className="block text-sm font-medium text-[var(--color-text)] mb-1"
            htmlFor={id}
          >
            {label}
            {required && (
              <span className="text-[var(--color-danger)] ml-1">*</span>
            )}
          </label>
        )}

        <div ref={containerRef} className="relative" data-testid="signature-container">
          <canvas
            ref={canvasRef}
            id={id}
            width={canvasWidth}
            height={height}
            className={cn(
              GLOBAL_UI_CONFIG.signaturePad,
              error && "border-[var(--color-danger)]",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            data-testid="signature-canvas"
          />

          {!disabled && (
            <button
              type="button"
              className={GLOBAL_UI_CONFIG.signatureClearBtn}
              onClick={handleClear}
              data-testid="signature-clear-btn"
            >
              Clear
            </button>
          )}
        </div>

        <p
          className="text-xs text-[var(--color-text-tertiary)] mt-1"
          data-testid="signature-help"
        >
          Sign above inside the box.
        </p>

        {error && errorMessage && (
          <p
            className="text-xs text-[var(--color-danger)] mt-1"
            role="alert"
            data-testid="signature-error"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

AICSignature.displayName = "AICSignature";
