/**
 * Rating state logic and pure helper functions.
 * Framework-agnostic.
 * Source: Angular rating.component.ts
 */

import type { RatingSize } from "./rating.types";

/** Generate stars array [1, 2, ..., max]. */
export function generateStars(max: number): number[] {
  return Array.from({ length: max }, (_, i) => i + 1);
}

/** Check if a star position is filled based on hover or current value. */
export function isStarFilled(star: number, hoverValue: number, currentValue: number): boolean {
  const target = hoverValue > 0 ? hoverValue : currentValue;
  return star <= target;
}

/** Check if a star is half-filled. */
export function isStarHalf(star: number, hoverValue: number, currentValue: number): boolean {
  const target = hoverValue > 0 ? hoverValue : currentValue;
  return star - 0.5 === target;
}

/** Compute rating from click position for half-star support. */
export function computeRatingFromEvent(
  star: number,
  allowHalf: boolean,
  offsetX: number,
  width: number,
): number {
  if (allowHalf && offsetX < width / 2) {
    return star - 0.5;
  }
  return star;
}

/** Size config for star icons. */
export interface RatingSizeConfig {
  icon: string;
  text: string;
}

export const ratingSizeStyles: Record<RatingSize, RatingSizeConfig> = {
  sm: { icon: "w-5 h-5", text: "text-xs" },
  md: { icon: "w-8 h-8", text: "text-sm" },
  lg: { icon: "w-10 h-10", text: "text-base" },
};
