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
export declare class AuditDiffService {
    private readonly sanitizer;
    constructor(sanitizer: AuditSanitizerService);
    private readonly FIELD_LABELS;
    private readonly IGNORED_FIELDS;
    computeDiff(before: Record<string, any> | null, after: Record<string, any> | null, entityType: string): FieldChange[];
    private computeCreateDiff;
    private computeUpdateDiff;
    private normalize;
    private stringify;
    private detectType;
    formatDisplay(value: any, fieldName: string): string;
    private humanize;
}
