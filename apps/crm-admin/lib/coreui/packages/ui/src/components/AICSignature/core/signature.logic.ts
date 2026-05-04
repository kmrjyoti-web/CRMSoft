/**
 * Signature state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular signature.component.ts — exact port of canvas operations.
 */

// ---------------------------------------------------------------------------
// getCanvasCoords — port of Angular getCoords(event)
// Extracts x/y coordinates from mouse or touch events relative to canvas
// ---------------------------------------------------------------------------

export function getCanvasCoords(
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();

  if ("touches" in event && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX - rect.left,
      y: event.touches[0].clientY - rect.top,
    };
  }

  const mouseEvent = event as MouseEvent;
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top,
  };
}

// ---------------------------------------------------------------------------
// initCanvasContext — sets up canvas 2D context drawing properties
// Port of Angular canvas init: lineWidth=2, lineCap='round', strokeStyle='#000'
// ---------------------------------------------------------------------------

export function initCanvasContext(
  ctx: CanvasRenderingContext2D,
  lineWidth: number = 2,
  lineColor: string = "#000",
): void {
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.strokeStyle = lineColor;
}

// ---------------------------------------------------------------------------
// clearCanvas — clears the entire canvas area
// ---------------------------------------------------------------------------

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
}

// ---------------------------------------------------------------------------
// canvasToDataUrl — saves canvas content as PNG data URL
// Port of Angular save() → canvas.toDataURL()
// ---------------------------------------------------------------------------

export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL();
}

// ---------------------------------------------------------------------------
// loadImageToCanvas — loads an existing data URL image onto the canvas
// Port of Angular init that renders existing value
// ---------------------------------------------------------------------------

export function loadImageToCanvas(
  ctx: CanvasRenderingContext2D,
  dataUrl: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
