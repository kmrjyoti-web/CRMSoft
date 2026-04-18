"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditSummaryGeneratorService = void 0;
const common_1 = require("@nestjs/common");
let AuditSummaryGeneratorService = class AuditSummaryGeneratorService {
    generateSummary(params) {
        const { action, entityType, entityLabel, performedByName, fieldChanges } = params;
        const actor = performedByName || 'System';
        const entityName = this.formatEntityType(entityType);
        switch (action) {
            case 'CREATE':
                return `${actor} created ${entityName} ${entityLabel}`;
            case 'UPDATE': {
                if (fieldChanges.length === 0)
                    return `${actor} updated ${entityName} ${entityLabel}`;
                if (fieldChanges.length === 1) {
                    const fc = fieldChanges[0];
                    return `${actor} updated ${entityName} ${entityLabel}: changed ${fc.fieldLabel} from ${fc.oldDisplayValue || '—'} to ${fc.newDisplayValue || '—'}`;
                }
                if (fieldChanges.length <= 3) {
                    const fieldList = fieldChanges.map(fc => fc.fieldLabel).join(', ');
                    return `${actor} updated ${entityName} ${entityLabel}: changed ${fieldList}`;
                }
                return `${actor} updated ${entityName} ${entityLabel}: changed ${fieldChanges.length} fields`;
            }
            case 'STATUS_CHANGE': {
                const statusChange = fieldChanges.find(fc => fc.fieldName === 'status');
                if (statusChange) {
                    return `${actor} changed ${entityName} ${entityLabel} status from ${statusChange.oldDisplayValue || '—'} to ${statusChange.newDisplayValue || '—'}`;
                }
                return `${actor} updated ${entityName} ${entityLabel} status`;
            }
            case 'DELETE':
                return `${actor} deleted ${entityName} ${entityLabel}`;
            case 'SOFT_DELETE':
                return `${actor} archived ${entityName} ${entityLabel}`;
            case 'RESTORE':
                return `${actor} restored ${entityName} ${entityLabel}`;
            case 'BULK_UPDATE':
                return `${actor} bulk updated ${entityName} records`;
            case 'BULK_DELETE':
                return `${actor} bulk deleted ${entityName} records`;
            case 'LOGIN':
                return `${actor} logged in`;
            case 'LOGOUT':
                return `${actor} logged out`;
            case 'EXPORT':
                return `${actor} exported ${entityName} data`;
            default:
                return `${actor} performed ${action} on ${entityName} ${entityLabel}`;
        }
    }
    formatEntityType(entityType) {
        return entityType.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    }
};
exports.AuditSummaryGeneratorService = AuditSummaryGeneratorService;
exports.AuditSummaryGeneratorService = AuditSummaryGeneratorService = __decorate([
    (0, common_1.Injectable)()
], AuditSummaryGeneratorService);
//# sourceMappingURL=audit-summary-generator.service.js.map