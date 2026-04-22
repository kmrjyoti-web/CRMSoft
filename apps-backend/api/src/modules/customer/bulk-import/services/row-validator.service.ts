import { Injectable } from '@nestjs/common';
import { IndianValidatorsService } from './indian-validators.service';

export interface RowValidationResult {
  valid: boolean;
  errors: { field: string; message: string; value?: string }[];
  warnings: { field: string; message: string; value?: string }[];
  cleanedData: Record<string, any>;
}

@Injectable()
export class RowValidatorService {
  constructor(private readonly validators: IndianValidatorsService) {}

  /** Validate a single row's mapped data against validation rules */
  validateRow(
    mappedData: Record<string, any>,
    validationRules: any[],
  ): RowValidationResult {
    const errors: { field: string; message: string; value?: string }[] = [];
    const warnings: { field: string; message: string; value?: string }[] = [];
    const cleanedData = { ...mappedData };

    for (const rule of validationRules) {
      const fieldPath = rule.field;
      const value = this.getNestedValue(mappedData, fieldPath);
      const strValue = value != null ? String(value) : '';

      const result = this.validators.validate(strValue, rule.validator, rule.params);

      if (!result.valid) {
        if (rule.severity === 'WARNING') {
          warnings.push({ field: fieldPath, message: result.error || 'Validation failed', value: strValue });
        } else {
          errors.push({ field: fieldPath, message: result.error || 'Validation failed', value: strValue });
        }
      } else if (result.cleanedValue !== undefined && result.cleanedValue !== strValue) {
        this.setNestedValue(cleanedData, fieldPath, result.cleanedValue);
      }
    }

    // Auto-validate required fields: firstName
    if (!mappedData.firstName && !mappedData.name) {
      errors.push({ field: 'firstName', message: 'Name/First name is required' });
    }

    return { valid: errors.length === 0, errors, warnings, cleanedData };
  }

  /** Validate all rows and return results keyed by row index */
  validateAllRows(
    rows: { rowNumber: number; mappedData: Record<string, any> }[],
    validationRules: any[],
  ): Map<number, RowValidationResult> {
    const results = new Map<number, RowValidationResult>();
    for (const row of rows) {
      results.set(row.rowNumber, this.validateRow(row.mappedData, validationRules || []));
    }
    return results;
  }

  /** Get nested value from object (e.g., "organization.name") */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((o, key) => o?.[key], obj);
  }

  /** Set nested value in object */
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }
}
