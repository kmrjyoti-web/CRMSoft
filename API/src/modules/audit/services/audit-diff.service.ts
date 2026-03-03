import { Injectable } from '@nestjs/common';
import { AuditSanitizerService } from './audit-sanitizer.service';

export interface FieldChange {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  oldValue: string | null;
  newValue: string | null;
  oldDisplayValue: string | null;
  newDisplayValue: string | null;
  isSensitive: boolean;
}

@Injectable()
export class AuditDiffService {
  constructor(private readonly sanitizer: AuditSanitizerService) {}

  private readonly FIELD_LABELS: Record<string, Record<string, string>> = {
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

  private readonly IGNORED_FIELDS = [
    'id', 'createdAt', 'updatedAt', 'created_at', 'updated_at',
    'password', 'passwordHash', 'refreshToken', 'configJson', 'config_json',
  ];

  computeDiff(
    before: Record<string, any> | null,
    after: Record<string, any> | null,
    entityType: string,
  ): FieldChange[] {
    if (!before && !after) return [];

    // DELETE — no per-field changes, snapshot is stored separately
    if (before && !after) return [];

    // CREATE — only include key non-null fields
    if (!before && after) {
      return this.computeCreateDiff(after, entityType);
    }

    // UPDATE — field-by-field comparison
    return this.computeUpdateDiff(before!, after!, entityType);
  }

  private computeCreateDiff(after: Record<string, any>, entityType: string): FieldChange[] {
    const changes: FieldChange[] = [];
    const labels = this.FIELD_LABELS[entityType] || {};

    for (const [key, value] of Object.entries(after)) {
      if (this.IGNORED_FIELDS.includes(key)) continue;
      if (value === null || value === undefined) continue;
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) continue;
      if (!labels[key]) continue; // Only include labeled fields for CREATE

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

  private computeUpdateDiff(
    before: Record<string, any>,
    after: Record<string, any>,
    entityType: string,
  ): FieldChange[] {
    const changes: FieldChange[] = [];
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const labels = this.FIELD_LABELS[entityType] || {};

    for (const key of allKeys) {
      if (this.IGNORED_FIELDS.includes(key)) continue;
      // Skip nested relation objects
      const bVal = before[key];
      const aVal = after[key];
      if (typeof bVal === 'object' && bVal !== null && !Array.isArray(bVal) && !(bVal instanceof Date) && typeof bVal !== 'number') continue;
      if (typeof aVal === 'object' && aVal !== null && !Array.isArray(aVal) && !(aVal instanceof Date) && typeof aVal !== 'number') continue;

      const normalizedBefore = this.normalize(bVal);
      const normalizedAfter = this.normalize(aVal);

      if (normalizedBefore === normalizedAfter) continue;

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

  private normalize(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object' && 'toNumber' in value) return String(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  private stringify(value: any): string | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object' && 'toNumber' in value) return String(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  private detectType(oldVal: any, newVal: any): string {
    const val = newVal ?? oldVal;
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return 'BOOLEAN';
    if (typeof val === 'number') return 'NUMBER';
    if (val instanceof Date) return 'DATE';
    if (typeof val === 'object' && 'toNumber' in val) return 'DECIMAL';
    if (typeof val === 'string') {
      if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return 'DATE';
      if (val === val.toUpperCase() && val.includes('_')) return 'ENUM';
      return 'STRING';
    }
    if (Array.isArray(val)) return 'JSON';
    if (typeof val === 'object') return 'JSON';
    return 'STRING';
  }

  formatDisplay(value: any, fieldName: string): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) {
      return value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    // Enum formatting: DEMO_SCHEDULED → Demo Scheduled
    if (typeof value === 'string' && value === value.toUpperCase() && value.includes('_')) {
      return value.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    }
    // Currency fields
    if (typeof value === 'number' && ['expectedValue', 'totalAmount', 'subtotal', 'targetValue', 'currentValue', 'discountValue'].includes(fieldName)) {
      return `₹${Number(value).toLocaleString('en-IN')}`;
    }
    return String(value);
  }

  private humanize(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .replace(/Id$/, '')
      .trim();
  }
}
