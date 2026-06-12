/**
 * Pure-math positioning utilities.
 * Framework-agnostic — no DOM types.
 *
 * Computes absolute position coordinates for floating content relative to a
 * trigger element, with flip and shift collision strategies.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** 12-position placement options (4 sides x 3 alignments). */
export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

/** Plain object representing a bounding rectangle (no DOM dependency). */
export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Viewport dimensions. */
export interface ViewportSize {
  width: number;
  height: number;
}

/** Size of the floating content element. */
export interface ContentSize {
  width: number;
  height: number;
}

/** Configuration for the position computation. */
export interface PositionConfig {
  /** Desired placement relative to the trigger. */
  placement: Placement;
  /** Offset distance (in px) between trigger and content. */
  offset?: number;
  /** Minimum viewport edge padding (in px). */
  padding?: number;
  /** Whether to flip to the opposite side when content overflows. */
  flip?: boolean;
  /** Whether to shift along the cross-axis to stay within the viewport. */
  shift?: boolean;
  /** Whether to compute arrow position. */
  arrow?: boolean;
}

/** Result of position computation. */
export interface ComputedPosition {
  /** Absolute top position in px. */
  top: number;
  /** Absolute left position in px. */
  left: number;
  /** The final placement after flip (may differ from requested). */
  placement: Placement;
  /** Arrow position relative to the content element (if arrow is enabled). */
  arrowTop?: number;
  /** Arrow position relative to the content element (if arrow is enabled). */
  arrowLeft?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extracts the primary side from a placement string. */
function getSide(placement: Placement): "top" | "bottom" | "left" | "right" {
  if (placement.startsWith("top")) return "top";
  if (placement.startsWith("bottom")) return "bottom";
  if (placement.startsWith("left")) return "left";
  return "right";
}

/** Extracts the alignment from a placement string. */
function getAlignment(placement: Placement): "start" | "center" | "end" {
  if (placement.endsWith("-start")) return "start";
  if (placement.endsWith("-end")) return "end";
  return "center";
}

/** Returns the opposite side. */
function getOppositeSide(side: "top" | "bottom" | "left" | "right"): "top" | "bottom" | "left" | "right" {
  const opposites: Record<string, "top" | "bottom" | "left" | "right"> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };
  return opposites[side];
}

/** Rebuilds a placement from side + alignment. */
function buildPlacement(
  side: "top" | "bottom" | "left" | "right",
  alignment: "start" | "center" | "end",
): Placement {
  if (alignment === "center") return side as Placement;
  return `${side}-${alignment}` as Placement;
}

/**
 * Computes raw top/left for a given side, alignment, trigger rect, content
 * size, and offset. No clamping or flipping applied here.
 */
function computeRawPosition(
  side: "top" | "bottom" | "left" | "right",
  alignment: "start" | "center" | "end",
  trigger: Rect,
  content: ContentSize,
  offset: number,
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  // Primary axis
  switch (side) {
    case "top":
      top = trigger.top - content.height - offset;
      break;
    case "bottom":
      top = trigger.top + trigger.height + offset;
      break;
    case "left":
      left = trigger.left - content.width - offset;
      break;
    case "right":
      left = trigger.left + trigger.width + offset;
      break;
  }

  // Cross-axis (alignment)
  if (side === "top" || side === "bottom") {
    switch (alignment) {
      case "start":
        left = trigger.left;
        break;
      case "center":
        left = trigger.left + trigger.width / 2 - content.width / 2;
        break;
      case "end":
        left = trigger.left + trigger.width - content.width;
        break;
    }
  } else {
    // side is left or right
    switch (alignment) {
      case "start":
        top = trigger.top;
        break;
      case "center":
        top = trigger.top + trigger.height / 2 - content.height / 2;
        break;
      case "end":
        top = trigger.top + trigger.height - content.height;
        break;
    }
  }

  return { top, left };
}

/**
 * Checks whether the content overflows the viewport on the primary side.
 */
function overflowsOnSide(
  side: "top" | "bottom" | "left" | "right",
  pos: { top: number; left: number },
  content: ContentSize,
  viewport: ViewportSize,
  padding: number,
): boolean {
  switch (side) {
    case "top":
      return pos.top < padding;
    case "bottom":
      return pos.top + content.height > viewport.height - padding;
    case "left":
      return pos.left < padding;
    case "right":
      return pos.left + content.width > viewport.width - padding;
  }
}

// ---------------------------------------------------------------------------
// computePosition
// ---------------------------------------------------------------------------

/**
 * Computes the absolute position for floating content relative to a trigger.
 *
 * @param trigger  - Bounding rect of the trigger element.
 * @param content  - Width/height of the floating content.
 * @param viewport - Viewport dimensions.
 * @param config   - Placement, offset, padding, and collision strategies.
 * @returns Computed position with final placement and optional arrow coords.
 */
export function computePosition(
  trigger: Rect,
  content: ContentSize,
  viewport: ViewportSize,
  config: PositionConfig,
): ComputedPosition {
  const {
    placement,
    offset = 8,
    padding = 8,
    flip: shouldFlip = true,
    shift: shouldShift = true,
    arrow: computeArrow = false,
  } = config;

  let side = getSide(placement);
  const alignment = getAlignment(placement);

  // Compute initial position
  let pos = computeRawPosition(side, alignment, trigger, content, offset);

  // ---- Flip strategy ----
  if (shouldFlip && overflowsOnSide(side, pos, content, viewport, padding)) {
    const oppositeSide = getOppositeSide(side);
    const flippedPos = computeRawPosition(oppositeSide, alignment, trigger, content, offset);

    // Only flip if the opposite side doesn't also overflow
    if (!overflowsOnSide(oppositeSide, flippedPos, content, viewport, padding)) {
      side = oppositeSide;
      pos = flippedPos;
    }
  }

  // ---- Shift strategy ----
  if (shouldShift) {
    // Clamp horizontal
    if (pos.left < padding) {
      pos.left = padding;
    } else if (pos.left + content.width > viewport.width - padding) {
      pos.left = viewport.width - padding - content.width;
    }

    // Clamp vertical
    if (pos.top < padding) {
      pos.top = padding;
    } else if (pos.top + content.height > viewport.height - padding) {
      pos.top = viewport.height - padding - content.height;
    }
  }

  const finalPlacement = buildPlacement(side, alignment);

  const result: ComputedPosition = {
    top: pos.top,
    left: pos.left,
    placement: finalPlacement,
  };

  // ---- Arrow position ----
  if (computeArrow) {
    const triggerCenterX = trigger.left + trigger.width / 2;
    const triggerCenterY = trigger.top + trigger.height / 2;

    if (side === "top" || side === "bottom") {
      // Arrow is on the horizontal axis relative to the content box
      result.arrowLeft = Math.max(
        8,
        Math.min(triggerCenterX - pos.left, content.width - 8),
      );
      result.arrowTop = side === "top" ? content.height : 0;
    } else {
      // Arrow is on the vertical axis relative to the content box
      result.arrowTop = Math.max(
        8,
        Math.min(triggerCenterY - pos.top, content.height - 8),
      );
      result.arrowLeft = side === "left" ? content.width : 0;
    }
  }

  return result;
}
