import { Injectable } from '@nestjs/common';
import { FieldChange } from './audit-diff.service';

@Injectable()
export class AuditSummaryGeneratorService {
  generateSummary(params: {
    action: string;
    entityType: string;
    entityLabel: string;
    performedByName: string;
    fieldChanges: FieldChange[];
  }): string {
    const { action, entityType, entityLabel, performedByName, fieldChanges } = params;
    const actor = performedByName || 'System';
    const entityName = this.formatEntityType(entityType);

    switch (action) {
      case 'CREATE':
        return `${actor} created ${entityName} ${entityLabel}`;

      case 'UPDATE': {
        if (fieldChanges.length === 0) return `${actor} updated ${entityName} ${entityLabel}`;
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

  private formatEntityType(entityType: string): string {
    return entityType.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }
}
