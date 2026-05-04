// Pure TypeScript — no framework imports
// Source: core/ui-kit/angular/src/lib/control-library/shared/controls/base-control.ts

import type {
  FormFieldConfig,
  ValidationConfig,
  ControlType,
  Option,
  SuffixAction,
} from "../models/form-schema.types";
import type {
  UiConfig,
  ControlSize,
  ControlSizeConfig,
} from "../models/ui-config.types";
import type { IconName } from "../models/icon.types";
import type { ControlLike } from "../utils/validation.util";

// ── Base Control Props ──────────────────────────────────

/**
 * All possible props for a dynamic form control.
 * Maps 1:1 to Angular's `@Input()` properties on `BaseDynamicControl`.
 *
 * Resolution priority:
 * 1. Direct props (id, label, disabled…) override field config
 * 2. If `control` prop provided → use it directly
 * 3. If `field` + `formValues` provided → read value from formValues[field.key]
 * 4. Field-level `ui` overrides global GLOBAL_UI_CONFIG
 * 5. Field-level `size` overrides default 'medium'
 */
export interface BaseControlProps {
  // Core — from FormFieldConfig via form system
  field?: FormFieldConfig;
  formValues?: Record<string, unknown>;
  formErrors?: Record<string, string | null>;
  formTouched?: Record<string, boolean>;
  ui?: UiConfig;

  // Standalone — direct control instance
  control?: ControlLike | null;

  // HTML-like standalone props (override field config)
  id?: string;
  label?: string;
  type?: ControlType;
  placeholder?: string;
  value?: unknown;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;

  // Validators
  min?: number | string;
  max?: number | string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;

  // Data & Visuals
  options?: Option[];
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  suffixAction?: SuffixAction;
  size?: ControlSize;
  description?: string;
  tooltip?: string;
  props?: Record<string, unknown>;
  error?: string;
  variant?: string;

  // Design token override
  dt?: Record<string, any>;

  // Events
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// ── Resolved Control Config ─────────────────────────────

/**
 * Fully resolved control configuration after merging field config,
 * direct props, form state, UI config, and size styles.
 *
 * This is the output of the resolution logic (useBaseControl hook).
 */
export interface ResolvedControlConfig {
  key: string;
  label: string;
  placeholder: string;
  type: ControlType;
  value: unknown;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  size: ControlSize;
  sizeStyles: ControlSizeConfig;
  variant: string;
  uiConfig: UiConfig;
  validators: ValidationConfig;
  options: Option[];
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  suffixAction?: SuffixAction;
  props: Record<string, unknown>;
  tokenStyles: Record<string, string>;
}
