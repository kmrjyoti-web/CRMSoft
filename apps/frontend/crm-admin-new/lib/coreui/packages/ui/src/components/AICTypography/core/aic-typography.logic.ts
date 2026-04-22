/**
 * AICTypography pure logic functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular aic-typography.component.ts
 */

import type {
  TypographyVariant,
  TypographyLevel,
  TypographyWeight,
} from "./aic-typography.types";

// ---------------------------------------------------------------------------
// Semantic color presets
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
// Class generation
// ---------------------------------------------------------------------------

/**
 * Builds the CSS class string for the typography element based on
 * variant, level, weight, and text decoration options.
 */
export function getTypographyClasses(props: {
  variant: TypographyVariant;
  level: TypographyLevel;
  weight?: TypographyWeight;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  deleted?: boolean;
  muted?: boolean;
  color?: string;
}): string {
  const classes: string[] = ["aic-typography"];
  const { variant, level } = props;

  // Variant-based class
  if (variant === "display") classes.push(`display-${level}`);
  else if (variant === "heading") classes.push(`h${level}`);
  else classes.push(variant);

  // Font weight
  if (props.bold) classes.push("font-bold");
  else if (props.weight) classes.push(`font-${props.weight}`);

  // Text decorations
  if (props.italic) classes.push("italic");
  if (props.underline) classes.push("underline");
  if (props.deleted) classes.push("line-through");

  // Color
  if (props.muted) {
    classes.push("text-muted");
  } else if (props.color && SEMANTIC_COLORS.includes(props.color)) {
    classes.push(`text-${props.color}`);
  }

  return classes.join(" ");
}

// ---------------------------------------------------------------------------
// Tag resolution
// ---------------------------------------------------------------------------

/**
 * Returns the HTML tag name to render based on variant and level.
 * - display/heading: h1-h6
 * - label: label
 * - caption: small
 * - text: span
 */
export function getTypographyTag(
  variant: TypographyVariant,
  level: TypographyLevel,
): string {
  if (variant === "display" || variant === "heading") return `h${level}`;
  if (variant === "label") return "label";
  if (variant === "caption") return "small";
  return "span";
}
