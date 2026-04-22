/**
 * React AICTypography component.
 * Typography component with variant/level/weight/color/styling options.
 * Renders dynamic tags (h1-h6, label, small, span) based on variant + level.
 *
 * Source: Angular aic-typography.component.ts
 */

import React from "react";

import {
  cn,
  getTypographyClasses,
  getTypographyTag,
} from "@coreui/ui";

import type {
  TypographyVariant,
  TypographyLevel,
  TypographyWeight,
  AICTypographyProps as CoreAICTypographyProps,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props (extends core with React children)
// ---------------------------------------------------------------------------

export interface AICTypographyProps extends CoreAICTypographyProps {
  /** Content to render. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Semantic color presets (used to check if color is a preset or custom)
// ---------------------------------------------------------------------------

const SEMANTIC_COLORS = [
  "primary",
  "secondary",
  "accent",
  "muted",
  "success",
  "warning",
  "danger",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICTypography: React.FC<AICTypographyProps> = (props) => {
  const {
    variant = "text",
    level = 1,
    size,
    weight,
    color,
    bold,
    italic,
    underline,
    deleted,
    muted,
    icon,
    enableIcon,
    className,
    children,
  } = props;

  // -----------------------------------------------------------------------
  // Resolve tag and classes
  // -----------------------------------------------------------------------

  const Tag = getTypographyTag(variant, level) as keyof JSX.IntrinsicElements;

  const typographyClasses = getTypographyClasses({
    variant,
    level,
    weight,
    bold,
    italic,
    underline,
    deleted,
    muted,
    color,
  });

  // -----------------------------------------------------------------------
  // Inline styles for custom size/color
  // -----------------------------------------------------------------------

  const inlineStyle: React.CSSProperties = {};

  if (size) {
    inlineStyle.fontSize = size;
  }

  // Apply color as inline style only for non-semantic (custom) colors
  if (color && !muted && !SEMANTIC_COLORS.includes(color)) {
    inlineStyle.color = color;
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Tag
      className={cn(typographyClasses, className)}
      style={Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined}
      data-testid="aic-typography"
    >
      {enableIcon && icon && (
        <span
          className="inline-flex items-center mr-1"
          data-testid="aic-typography-icon"
        >
          {icon}
        </span>
      )}
      {children}
    </Tag>
  );
};

AICTypography.displayName = "AICTypography";
