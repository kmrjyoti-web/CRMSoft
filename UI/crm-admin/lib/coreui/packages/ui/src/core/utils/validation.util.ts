// Pure TypeScript — no framework imports
// Source: core/ui-kit/angular/src/lib/control-library/utility/validation.util.ts

import type { ValidationConfig } from "../models/form-schema.types";

/**
 * Framework-agnostic replacement for Angular's AbstractControl.
 */
export interface ControlLike {
  value: unknown;
  errors: Record<string, any> | null;
  invalid: boolean;
  dirty: boolean;
  touched: boolean;
}

/**
 * Utility for extracting validation messages and checking validity.
 */
export class ValidationUtil {
  /**
   * Returns a human-readable error message based on the control's errors.
   * @param control The ControlLike to check.
   * @param label Optional label to include in the message (e.g., "Email is required").
   */
  static getErrorMessage(control: ControlLike | null, label?: string): string {
    if (!control || !control.errors) return "";

    const errors = control.errors;
    const fieldName = label || "Field";

    if (errors["required"]) {
      return `${fieldName} is required`;
    }

    if (errors["email"]) {
      return `Invalid email format`;
    }

    if (errors["minlength"]) {
      const requiredLength = errors["minlength"].requiredLength;
      return `Minimum ${requiredLength} characters required`;
    }

    if (errors["maxlength"]) {
      const requiredLength = errors["maxlength"].requiredLength;
      return `Maximum ${requiredLength} characters allowed`;
    }

    if (errors["pattern"]) {
      return `Invalid format`;
    }

    if (errors["min"]) {
      return `Value must be at least ${errors["min"].min}`;
    }

    if (errors["max"]) {
      return `Value must be at most ${errors["max"].max}`;
    }

    return "Invalid value";
  }

  /**
   * Checks if a control is invalid and has been touched or dirty.
   */
  static hasError(control: ControlLike | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Pure validation function that runs all validators from a ValidationConfig
   * and returns an errors object or null.
   */
  static validate(
    value: unknown,
    config: ValidationConfig,
  ): Record<string, any> | null {
    const errors: Record<string, any> = {};

    // required
    if (config.required) {
      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      ) {
        errors["required"] = true;
      }
    }

    // email
    if (config.email && typeof value === "string" && value.length > 0) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        errors["email"] = true;
      }
    }

    // minLength
    if (
      config.minLength !== undefined &&
      typeof value === "string" &&
      value.length > 0
    ) {
      if (value.length < config.minLength) {
        errors["minlength"] = {
          requiredLength: config.minLength,
          actualLength: value.length,
        };
      }
    }

    // maxLength
    if (
      config.maxLength !== undefined &&
      typeof value === "string" &&
      value.length > 0
    ) {
      if (value.length > config.maxLength) {
        errors["maxlength"] = {
          requiredLength: config.maxLength,
          actualLength: value.length,
        };
      }
    }

    // pattern
    if (
      config.pattern !== undefined &&
      typeof value === "string" &&
      value.length > 0
    ) {
      const regex = new RegExp(config.pattern);
      if (!regex.test(value)) {
        errors["pattern"] = { requiredPattern: config.pattern, actualValue: value };
      }
    }

    // min
    if (config.min !== undefined && value !== null && value !== undefined) {
      const numValue = Number(value);
      const minValue = Number(config.min);
      if (!isNaN(numValue) && numValue < minValue) {
        errors["min"] = { min: config.min, actual: numValue };
      }
    }

    // max
    if (config.max !== undefined && value !== null && value !== undefined) {
      const numValue = Number(value);
      const maxValue = Number(config.max);
      if (!isNaN(numValue) && numValue > maxValue) {
        errors["max"] = { max: config.max, actual: numValue };
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}
