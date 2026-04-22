/**
 * React AICIcon component.
 * Renders icons from the CoreUI icon registry or raw SVG strings.
 *
 * Source: Angular aic-icon.component.ts
 */

import React, { useMemo } from "react";

import {
  cn,
  getIconSafe,
  resolveIconSize,
  processSvgForColor,
} from "@coreui/ui";

import type { AICIconSize } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICIcon props.
 */
export interface AICIconProps {
  /** Icon name — resolved via `getIconSafe()` from the icon registry. */
  name?: string;
  /** Size preset or custom CSS size string. */
  size?: AICIconSize;
  /** CSS color value applied to the icon. */
  color?: string;
  /** Background color applied to the icon wrapper. */
  bgColor?: string;
  /** Raw SVG string to render directly (overrides `name` lookup). */
  svgContent?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** Whether the icon should have a continuous spin animation. */
  spin?: boolean;
  /** Whether the icon should have a pulse animation. */
  pulse?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICIcon built on the shared core logic from `@coreui/ui`.
 *
 * Supports icon name lookup, raw SVG content, size presets, color, background
 * color, spin and pulse animations.
 */
export const AICIcon: React.FC<AICIconProps> = ({
  name,
  size,
  color,
  bgColor,
  svgContent,
  className,
  spin = false,
  pulse = false,
}) => {
  // -----------------------------------------------------------------------
  // Resolve SVG content
  // -----------------------------------------------------------------------

  const resolvedSvg = useMemo(() => {
    if (svgContent) {
      return processSvgForColor(svgContent);
    }
    if (name) {
      const svg = getIconSafe(name);
      if (svg) {
        return processSvgForColor(svg);
      }
    }
    return null;
  }, [name, svgContent]);

  // -----------------------------------------------------------------------
  // Nothing to render
  // -----------------------------------------------------------------------

  if (!resolvedSvg) return null;

  // -----------------------------------------------------------------------
  // Style composition
  // -----------------------------------------------------------------------

  const resolvedSize = resolveIconSize(size);

  const style: React.CSSProperties = {
    width: resolvedSize,
    height: resolvedSize,
    color: color || undefined,
    backgroundColor: bgColor || undefined,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const classes = cn(
    "aic-icon inline-flex shrink-0",
    spin && "animate-spin",
    pulse && "animate-pulse",
    className,
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <span
      className={classes}
      style={style}
      data-testid="aic-icon"
      role="img"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: resolvedSvg }}
    />
  );
};

AICIcon.displayName = "AICIcon";
