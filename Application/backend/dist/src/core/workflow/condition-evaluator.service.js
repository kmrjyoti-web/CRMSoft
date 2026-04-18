"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionEvaluatorService = void 0;
const common_1 = require("@nestjs/common");
let ConditionEvaluatorService = class ConditionEvaluatorService {
    evaluate(conditionConfig, entityData) {
        if (!conditionConfig || !conditionConfig.conditions || conditionConfig.conditions.length === 0) {
            return true;
        }
        const { conditions, logic } = conditionConfig;
        const results = conditions.map((c) => this.evaluateCondition(c, entityData));
        return logic === 'OR' ? results.some(Boolean) : results.every(Boolean);
    }
    evaluateCondition(cond, data) {
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
                }
                catch {
                    return false;
                }
            default:
                return false;
        }
    }
    getFieldValue(field, data) {
        const parts = field.split('.');
        let current = data;
        for (const part of parts) {
            if (current === null || current === undefined)
                return undefined;
            current = current[part];
        }
        return current;
    }
};
exports.ConditionEvaluatorService = ConditionEvaluatorService;
exports.ConditionEvaluatorService = ConditionEvaluatorService = __decorate([
    (0, common_1.Injectable)()
], ConditionEvaluatorService);
//# sourceMappingURL=condition-evaluator.service.js.map