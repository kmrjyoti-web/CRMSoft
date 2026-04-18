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
exports.AuditDiffService = void 0;
const common_1 = require("@nestjs/common");
const audit_sanitizer_service_1 = require("./audit-sanitizer.service");
let AuditDiffService = class AuditDiffService {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
        this.FIELD_LABELS = {
            LEAD: {
                leadNumber: 'Lead Number', status: 'Lead Status', priority: 'Priority',
                expectedValue: 'Expected Value', expectedCloseDate: 'Expected Close Date',
                allocatedToId: 'Allocated To', lostReason: 'Lost Reason', notes: 'Notes',
                contactId: 'Contact', organizationId: 'Organization',
            },
            CONTACT: {
                firstName: 'First Name', lastName: 'Last Name', designation: 'Designation',
                department: 'Department', organizationId: 'Organization', isActive: 'Active',
            },
            ORGANIZATION: {
                name: 'Name', type: 'Type', industry: 'Industry', website: 'Website',
                isActive: 'Active',
            },
            QUOTATION: {
                quotationNo: 'Quotation Number', status: 'Status', subtotal: 'Subtotal',
                totalAmount: 'Total Amount', discountValue: 'Discount', validUntil: 'Valid Until',
            },
            ACTIVITY: {
                type: 'Activity Type', subject: 'Subject', outcome: 'Outcome',
                scheduledAt: 'Scheduled At', completedAt: 'Completed At',
            },
            DEMO: {
                mode: 'Demo Mode', status: 'Status', scheduledAt: 'Scheduled Date',
                completedAt: 'Completed Date', result: 'Result',
            },
            TOUR_PLAN: {
                title: 'Title', status: 'Status', planDate: 'Plan Date',
            },
            USER: {
                firstName: 'First Name', lastName: 'Last Name', email: 'Email',
                phone: 'Phone', status: 'Status', userType: 'User Type', roleId: 'Role',
            },
            FOLLOW_UP: {
                title: 'Title', dueDate: 'Due Date', priority: 'Priority',
                assignedToId: 'Assigned To', completedAt: 'Completed At',
            },
            SALES_TARGET: {
                metric: 'Metric', targetValue: 'Target Value', currentValue: 'Current Value',
                period: 'Period', name: 'Name',
            },
        };
        this.IGNORED_FIELDS = [
            'id', 'createdAt', 'updatedAt', 'created_at', 'updated_at',
            'password', 'passwordHash', 'refreshToken', 'configJson', 'config_json',
        ];
    }
    computeDiff(before, after, entityType) {
        if (!before && !after)
            return [];
        if (before && !after)
            return [];
        if (!before && after) {
            return this.computeCreateDiff(after, entityType);
        }
        return this.computeUpdateDiff(before, after, entityType);
    }
    computeCreateDiff(after, entityType) {
        const changes = [];
        const labels = this.FIELD_LABELS[entityType] || {};
        for (const [key, value] of Object.entries(after)) {
            if (this.IGNORED_FIELDS.includes(key))
                continue;
            if (value === null || value === undefined)
                continue;
            if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date))
                continue;
            if (!labels[key])
                continue;
            changes.push({
                fieldName: key,
                fieldLabel: labels[key] || this.humanize(key),
                fieldType: this.detectType(null, value),
                oldValue: null,
                newValue: this.stringify(value),
                oldDisplayValue: null,
                newDisplayValue: this.formatDisplay(value, key),
                isSensitive: this.sanitizer.isSensitive(key),
            });
        }
        return changes;
    }
    computeUpdateDiff(before, after, entityType) {
        const changes = [];
        const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
        const labels = this.FIELD_LABELS[entityType] || {};
        for (const key of allKeys) {
            if (this.IGNORED_FIELDS.includes(key))
                continue;
            const bVal = before[key];
            const aVal = after[key];
            if (typeof bVal === 'object' && bVal !== null && !Array.isArray(bVal) && !(bVal instanceof Date) && typeof bVal !== 'number')
                continue;
            if (typeof aVal === 'object' && aVal !== null && !Array.isArray(aVal) && !(aVal instanceof Date) && typeof aVal !== 'number')
                continue;
            const normalizedBefore = this.normalize(bVal);
            const normalizedAfter = this.normalize(aVal);
            if (normalizedBefore === normalizedAfter)
                continue;
            changes.push({
                fieldName: key,
                fieldLabel: labels[key] || this.humanize(key),
                fieldType: this.detectType(bVal, aVal),
                oldValue: this.stringify(bVal),
                newValue: this.stringify(aVal),
                oldDisplayValue: this.formatDisplay(bVal, key),
                newDisplayValue: this.formatDisplay(aVal, key),
                isSensitive: this.sanitizer.isSensitive(key),
            });
        }
        return changes;
    }
    normalize(value) {
        if (value === null || value === undefined)
            return 'null';
        if (value instanceof Date)
            return value.toISOString();
        if (typeof value === 'object' && 'toNumber' in value)
            return String(value);
        if (typeof value === 'object')
            return JSON.stringify(value);
        return String(value);
    }
    stringify(value) {
        if (value === null || value === undefined)
            return null;
        if (value instanceof Date)
            return value.toISOString();
        if (typeof value === 'object' && 'toNumber' in value)
            return String(value);
        if (typeof value === 'object')
            return JSON.stringify(value);
        return String(value);
    }
    detectType(oldVal, newVal) {
        const val = newVal ?? oldVal;
        if (val === null || val === undefined)
            return 'NULL';
        if (typeof val === 'boolean')
            return 'BOOLEAN';
        if (typeof val === 'number')
            return 'NUMBER';
        if (val instanceof Date)
            return 'DATE';
        if (typeof val === 'object' && 'toNumber' in val)
            return 'DECIMAL';
        if (typeof val === 'string') {
            if (/^\d{4}-\d{2}-\d{2}T/.test(val))
                return 'DATE';
            if (val === val.toUpperCase() && val.includes('_'))
                return 'ENUM';
            return 'STRING';
        }
        if (Array.isArray(val))
            return 'JSON';
        if (typeof val === 'object')
            return 'JSON';
        return 'STRING';
    }
    formatDisplay(value, fieldName) {
        if (value === null || value === undefined)
            return '�';
        if (typeof value === 'boolean')
            return value ? 'Yes' : 'No';
        if (value instanceof Date) {
            return value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        if (typeof value === 'string' && value === value.toUpperCase() && value.includes('_')) {
            return value.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
        }
        if (typeof value === 'number' && ['expectedValue', 'totalAmount', 'subtotal', 'targetValue', 'currentValue', 'discountValue'].includes(fieldName)) {
            return `?${Number(value).toLocaleString('en-IN')}`;
        }
        return String(value);
    }
    humanize(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, s => s.toUpperCase())
            .replace(/Id$/, '')
            .trim();
    }
};
exports.AuditDiffService = AuditDiffService;
exports.AuditDiffService = AuditDiffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_sanitizer_service_1.AuditSanitizerService])
], AuditDiffService);
//# sourceMappingURL=audit-diff.service.js.map