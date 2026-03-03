/** Base size scale used across the design system. */
export type Size = "xs" | "sm" | "md" | "lg" | "xl";

/** Base variant palette. */
export type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "ghost";

/** Generic component props shared by all design system elements. */
export interface BaseComponentProps {
  /** Optional CSS class name(s). */
  className?: string;
  /** Unique identifier. */
  id?: string;
  /** Test selector. */
  "data-testid"?: string;
}

/** Props for components that support size variants. */
export interface SizableProps {
  size?: Size;
}

/** Props for components that support color variants. */
export interface VariantProps {
  variant?: Variant;
}

/** Props for components that can be disabled. */
export interface DisableableProps {
  disabled?: boolean;
}
