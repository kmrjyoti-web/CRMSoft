// Source: core/ui-kit/angular/src/lib/control-library/shared/controls/base-control.ts
import { useMemo } from "react";
import type {
  BaseControlProps,
  ResolvedControlConfig,
  ValidationConfig,
  ControlSize,
} from "@coreui/ui";
import {
  CONTROL_SIZES,
  GLOBAL_UI_CONFIG,
  StyleHelper,
  ValidationUtil,
} from "@coreui/ui";

/**
 * Resolves a `BaseControlProps` into a fully-resolved `ResolvedControlConfig`.
 *
 * Matches Angular `BaseDynamicControl.ngOnInit / ngOnChanges` resolution logic:
 * 1. Direct props (id, label, disabled…) override field config
 * 2. If `control` prop provided → use it directly
 * 3. If `field` + `formValues` provided → read value from formValues[field.key]
 * 4. Field-level `ui` overrides global GLOBAL_UI_CONFIG
 * 5. Field-level `size` overrides default 'medium'
 */
export function useBaseControl(props: BaseControlProps): ResolvedControlConfig {
  return useMemo(() => {
    const field = props.field;

    // 1. Key
    const key = props.id ?? field?.key ?? "standalone_control";

    // 2. Label (direct props win)
    const label = props.label ?? field?.label ?? "";

    // 3. Type
    const type = props.type ?? field?.type ?? "text";

    // 4. Placeholder
    const placeholder = props.placeholder ?? field?.placeholder ?? "";

    // 5. Value — priority: control → formValues[key] → direct value → defaultValue
    let value: unknown;
    if (props.control) {
      value = props.control.value;
    } else if (field && props.formValues) {
      value = props.formValues[field.key];
    } else {
      value = props.value ?? field?.defaultValue ?? "";
    }

    // 6. Disabled / Readonly / Required
    const disabled = props.disabled ?? false;
    const readonly =
      props.readonly ?? (field?.props?.["readonly"] as boolean) ?? false;
    const required = props.required ?? field?.validators?.required ?? false;

    // 7. Size
    const size: ControlSize = props.size ?? field?.size ?? "medium";
    const sizeStyles = CONTROL_SIZES[size];

    // 8. Variant
    const variant =
      props.variant ?? (field?.props?.["variant"] as string) ?? "default";

    // 9. UI Config — field.ui merged over GLOBAL_UI_CONFIG
    const uiConfig = field?.ui
      ? { ...GLOBAL_UI_CONFIG, ...field.ui }
      : props.ui ?? GLOBAL_UI_CONFIG;

    // 10. Validators — merge field.validators + direct props (direct wins)
    const fieldValidators = field?.validators ?? {};
    const validators: ValidationConfig = {
      required: props.required ?? fieldValidators.required,
      email: fieldValidators.email,
      minLength: props.minLength ?? fieldValidators.minLength,
      maxLength: props.maxLength ?? fieldValidators.maxLength,
      pattern: props.pattern ?? fieldValidators.pattern,
      min: props.min ?? fieldValidators.min,
      max: props.max ?? fieldValidators.max,
    };

    // 11. Error — priority: manual override → formErrors[key] → control errors → null
    let error: string | null = null;
    if (props.error !== undefined) {
      error = props.error;
    } else if (field && props.formErrors) {
      error = props.formErrors[field.key] ?? null;
    } else if (props.control) {
      error = ValidationUtil.hasError(props.control)
        ? ValidationUtil.getErrorMessage(props.control, label)
        : null;
    }

    // 12. Touched
    const touched =
      field && props.formTouched
        ? (props.formTouched[field.key] ?? false)
        : (props.control?.touched ?? false);

    // 13. Dirty
    const dirty = props.control?.dirty ?? false;

    // 14. Options
    const options = props.options ?? field?.options ?? [];

    // 15. Icons
    const prefixIcon = props.prefixIcon ?? field?.prefixIcon;
    const suffixIcon = props.suffixIcon ?? field?.suffixIcon;
    const suffixAction = props.suffixAction ?? field?.suffixAction;

    // 16. Props bag — merge field.props + direct props (direct wins)
    const fieldProps = field?.props ?? {};
    const directProps = props.props ?? {};
    const mergedProps: Record<string, unknown> = {
      ...fieldProps,
      ...directProps,
    };

    // 17. Design tokens → CSS variables
    const tokenStyles = props.dt
      ? StyleHelper.generateCssVariables(props.dt)
      : {};

    return {
      key,
      label,
      placeholder,
      type,
      value,
      disabled,
      readonly,
      required,
      error,
      touched,
      dirty,
      size,
      sizeStyles,
      variant,
      uiConfig,
      validators,
      options,
      prefixIcon,
      suffixIcon,
      suffixAction,
      props: mergedProps,
      tokenStyles,
    };
  }, [
    props.field,
    props.formValues,
    props.formErrors,
    props.formTouched,
    props.ui,
    props.control,
    props.id,
    props.label,
    props.type,
    props.placeholder,
    props.value,
    props.disabled,
    props.readonly,
    props.required,
    props.min,
    props.max,
    props.minLength,
    props.maxLength,
    props.pattern,
    props.options,
    props.prefixIcon,
    props.suffixIcon,
    props.suffixAction,
    props.size,
    props.description,
    props.tooltip,
    props.props,
    props.error,
    props.variant,
    props.dt,
  ]);
}
