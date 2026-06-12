/**
 * Animation utilities for transitions.
 * Framework-agnostic — no DOM types.
 *
 * Provides animation type/state classification and Tailwind class generation
 * for common enter/exit transitions.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supported animation transition types. */
export type AnimationType =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale";

/** Lifecycle state of an animation. */
export type AnimationState = "entering" | "entered" | "exiting" | "exited";

/** Configuration for an animation instance. */
export interface AnimationConfig {
  /** The type of animation transition. */
  type: AnimationType;
  /** Duration preset — maps to Tailwind duration classes. */
  duration?: "fast" | "normal" | "slow";
}

/** Resolved Tailwind classes for an animation frame. */
export interface AnimationClasses {
  /** Base transition classes (transition property + duration + easing). */
  base: string;
  /** State-specific transform/opacity classes. */
  state: string;
}

// ---------------------------------------------------------------------------
// Duration map
// ---------------------------------------------------------------------------

/** Maps duration presets to Tailwind duration utility classes. */
export const durationMap: Record<"fast" | "normal" | "slow", string> = {
  fast: "duration-150",
  normal: "duration-200",
  slow: "duration-300",
};

// ---------------------------------------------------------------------------
// State class maps per animation type
// ---------------------------------------------------------------------------

const fadeStateClasses: Record<AnimationState, string> = {
  entering: "opacity-0",
  entered: "opacity-100",
  exiting: "opacity-0",
  exited: "opacity-0",
};

const slideUpStateClasses: Record<AnimationState, string> = {
  entering: "opacity-0 translate-y-2",
  entered: "opacity-100 translate-y-0",
  exiting: "opacity-0 translate-y-2",
  exited: "opacity-0 translate-y-2",
};

const slideDownStateClasses: Record<AnimationState, string> = {
  entering: "opacity-0 -translate-y-2",
  entered: "opacity-100 translate-y-0",
  exiting: "opacity-0 -translate-y-2",
  exited: "opacity-0 -translate-y-2",
};

const slideLeftStateClasses: Record<AnimationState, string> = {
  entering: "opacity-0 -translate-x-full",
  entered: "opacity-100 translate-x-0",
  exiting: "opacity-0 -translate-x-full",
  exited: "opacity-0 -translate-x-full",
};

const slideRightStateClasses: Record<AnimationState, string> = {
  entering: "opacity-0 translate-x-full",
  entered: "opacity-100 translate-x-0",
  exiting: "opacity-0 translate-x-full",
  exited: "opacity-0 translate-x-full",
};

const scaleStateClasses: Record<AnimationState, string> = {
  entering: "opacity-0 scale-95",
  entered: "opacity-100 scale-100",
  exiting: "opacity-0 scale-95",
  exited: "opacity-0 scale-95",
};

/** Master lookup from animation type to its state class map. */
const animationStateMap: Record<AnimationType, Record<AnimationState, string>> = {
  fade: fadeStateClasses,
  "slide-up": slideUpStateClasses,
  "slide-down": slideDownStateClasses,
  "slide-left": slideLeftStateClasses,
  "slide-right": slideRightStateClasses,
  scale: scaleStateClasses,
};

// ---------------------------------------------------------------------------
// getAnimationClasses
// ---------------------------------------------------------------------------

/**
 * Returns the Tailwind classes for a given animation configuration and state.
 *
 * @param config - The animation type and duration preset.
 * @param state  - The current lifecycle state of the animation.
 * @returns An object with `base` (transition setup) and `state` (visual) classes.
 */
export function getAnimationClasses(
  config: AnimationConfig,
  state: AnimationState,
): AnimationClasses {
  const { type, duration = "normal" } = config;

  const base = `transition-all ${durationMap[duration]} ease-in-out`;
  const stateClasses = animationStateMap[type][state];

  return {
    base,
    state: stateClasses,
  };
}
