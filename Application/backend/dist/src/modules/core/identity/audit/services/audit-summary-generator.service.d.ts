import { FieldChange } from './audit-diff.service';
export declare class AuditSummaryGeneratorService {
    generateSummary(params: {
        action: string;
        entityType: string;
        entityLabel: string;
        performedByName: string;
        fieldChanges: FieldChange[];
    }): string;
    private formatEntityType;
}
