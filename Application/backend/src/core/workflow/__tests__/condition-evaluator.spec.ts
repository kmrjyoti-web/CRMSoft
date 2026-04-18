// @ts-nocheck
import { ConditionEvaluatorService } from '../condition-evaluator.service';
import { ConditionConfig } from '../interfaces/workflow-types.interface';

describe('ConditionEvaluatorService', () => {
  let service: ConditionEvaluatorService;

  beforeEach(() => {
    service = new ConditionEvaluatorService();
  });

  it('should return true when conditions are null or empty', () => {
    expect(service.evaluate(null, {})).toBe(true);
    expect(service.evaluate(undefined, {})).toBe(true);
    expect(service.evaluate({ conditions: [], logic: 'AND' }, {})).toBe(true);
  });

  it('should evaluate eq and ne operators', () => {
    const data = { status: 'ACTIVE', count: 5 };
    const eqConfig: ConditionConfig = { conditions: [{ field: 'status', operator: 'eq', value: 'ACTIVE' }], logic: 'AND' };
    const neConfig: ConditionConfig = { conditions: [{ field: 'status', operator: 'ne', value: 'INACTIVE' }], logic: 'AND' };
    expect(service.evaluate(eqConfig, data)).toBe(true);
    expect(service.evaluate(neConfig, data)).toBe(true);

    const failEq: ConditionConfig = { conditions: [{ field: 'status', operator: 'eq', value: 'INACTIVE' }], logic: 'AND' };
    expect(service.evaluate(failEq, data)).toBe(false);
  });

  it('should evaluate numeric operators (gt, gte, lt, lte, between)', () => {
    const data = { amount: 50000, quantity: 10 };
    expect(service.evaluate({ conditions: [{ field: 'amount', operator: 'gt', value: 40000 }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'amount', operator: 'gte', value: 50000 }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'quantity', operator: 'lt', value: 20 }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'quantity', operator: 'lte', value: 10 }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'amount', operator: 'between', value: [40000, 60000] }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'amount', operator: 'between', value: [60000, 80000] }], logic: 'AND' }, data)).toBe(false);
  });

  it('should evaluate in, notIn, contains, isNull, isNotNull operators', () => {
    const data = { city: 'Mumbai', description: 'Enterprise CRM solution', notes: null };
    expect(service.evaluate({ conditions: [{ field: 'city', operator: 'in', value: ['Mumbai', 'Delhi', 'Pune'] }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'city', operator: 'notIn', value: ['Delhi', 'Chennai'] }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'description', operator: 'contains', value: 'CRM' }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'notes', operator: 'isNull', value: null }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'city', operator: 'isNotNull', value: null }], logic: 'AND' }, data)).toBe(true);
  });

  it('should evaluate regex operator', () => {
    const data = { email: 'admin@crm.com' };
    expect(service.evaluate({ conditions: [{ field: 'email', operator: 'regex', value: '^admin@.*\\.com$' }], logic: 'AND' }, data)).toBe(true);
    expect(service.evaluate({ conditions: [{ field: 'email', operator: 'regex', value: '^sales@' }], logic: 'AND' }, data)).toBe(false);
  });

  it('should handle AND/OR logic correctly', () => {
    const data = { status: 'ACTIVE', amount: 30000 };
    const andConfig: ConditionConfig = {
      conditions: [
        { field: 'status', operator: 'eq', value: 'ACTIVE' },
        { field: 'amount', operator: 'gt', value: 50000 },
      ],
      logic: 'AND',
    };
    const orConfig: ConditionConfig = {
      conditions: [
        { field: 'status', operator: 'eq', value: 'ACTIVE' },
        { field: 'amount', operator: 'gt', value: 50000 },
      ],
      logic: 'OR',
    };
    expect(service.evaluate(andConfig, data)).toBe(false);
    expect(service.evaluate(orConfig, data)).toBe(true);
  });
});
