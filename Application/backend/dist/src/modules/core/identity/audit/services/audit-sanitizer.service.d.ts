export declare class AuditSanitizerService {
    private readonly REDACTED;
    private readonly SENSITIVE_KEYS;
    sanitize(obj: any): any;
    sanitizeSnapshot(snapshot: any, entityType: string): Record<string, unknown>;
    isSensitive(fieldName: string): boolean;
}
