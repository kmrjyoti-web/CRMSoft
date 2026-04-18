"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowValidatorService = void 0;
const common_1 = require("@nestjs/common");
const indian_validators_service_1 = require("./indian-validators.service");
let RowValidatorService = class RowValidatorService {
    constructor(validators) {
        this.validators = validators;
    }
    validateRow(mappedData, validationRules) {
        const errors = [];
        const warnings = [];
        const cleanedData = { ...mappedData };
        for (const rule of validationRules) {
            const fieldPath = rule.field;
            const value = this.getNestedValue(mappedData, fieldPath);
            const strValue = value != null ? String(value) : '';
            const result = this.validators.validate(strValue, rule.validator, rule.params);
            if (!result.valid) {
                if (rule.severity === 'WARNING') {
                    warnings.push({ field: fieldPath, message: result.error || 'Validation failed', value: strValue });
                }
                else {
                    errors.push({ field: fieldPath, message: result.error || 'Validation failed', value: strValue });
                }
            }
            else if (result.cleanedValue !== undefined && result.cleanedValue !== strValue) {
                this.setNestedValue(cleanedData, fieldPath, result.cleanedValue);
            }
        }
        if (!mappedData.firstName && !mappedData.name) {
            errors.push({ field: 'firstName', message: 'Name/First name is required' });
        }
        return { valid: errors.length === 0, errors, warnings, cleanedData };
    }
    validateAllRows(rows, validationRules) {
        const results = new Map();
        for (const row of rows) {
            results.set(row.rowNumber, this.validateRow(row.mappedData, validationRules || []));
        }
        return results;
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((o, key) => o?.[key], obj);
    }
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]])
                current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }
};
exports.RowValidatorService = RowValidatorService;
exports.RowValidatorService = RowValidatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [indian_validators_service_1.IndianValidatorsService])
], RowValidatorService);
//# sourceMappingURL=row-validator.service.js.map