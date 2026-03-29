import { Injectable } from '@nestjs/common';
import { ConditionConfig, ConditionRule } from './interfaces/workflow-types.interface';

@Injectable()
export class ConditionEvaluatorService {
  evaluate(conditionConfig: ConditionConfig | null | undefined, entityData: Record<string, any>): boolean {
    if (!conditionConfig || !conditionConfig.conditions || conditionConfig.conditions.length === 0) {
      return true;
    }

    const { conditions, logic } = conditionConfig;
    const results = conditions.map((c) => this.evaluateCondition(c, entityData));

    return logic === 'OR' ? results.some(Boolean) : results.every(Boolean);
  }

  private evaluateCondition(cond: ConditionRule, data: Record<string, any>): boolean {
    const fieldValue = this.getFieldValue(cond.field, data);
    const expected = cond.value;

    switch (cond.operator) {
      case 'eq':
        return fieldValue === expected;
      case 'ne':
        return fieldValue !== expected;
      case 'gt':
        return Number(fieldValue) > Number(expected);
      case 'gte':
        return Number(fieldValue) >= Number(expected);
      case 'lt':
        return Number(fieldValue) < Number(expected);
      case 'lte':
        return Number(fieldValue) <= Number(expected);
      case 'in':
        return Array.isArray(expected) && expected.includes(fieldValue);
      case 'notIn':
        return Array.isArray(expected) && !expected.includes(fieldValue);
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(String(expected));
      case 'isNull':
        return fieldValue === null || fieldValue === undefined;
      case 'isNotNull':
        return fieldValue !== null && fieldValue !== undefined;
      case 'between':
        if (Array.isArray(expected) && expected.length === 2) {
          const num = Number(fieldValue);
          return num >= Number(expected[0]) && num <= Number(expected[1]);
        }
        return false;
      case 'regex':
        try {
          return new RegExp(String(expected)).test(String(fieldValue));
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  private getFieldValue(field: string, data: Record<string, any>): any {
    const parts = field.split('.');
    let current: any = data;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }
}
