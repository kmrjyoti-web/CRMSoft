export declare class UpdateRetentionPolicyDto {
    retentionDays: number;
    archiveEnabled?: boolean;
    isActive?: boolean;
}
export declare class ExportAuditDto {
    format: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    dateFrom: string;
    dateTo: string;
}
export declare class CreateAuditLogDto {
    entityType: string;
    entityId: string;
    action: string;
    summary: string;
    source: string;
    module?: string;
    performedById?: string;
    performedByName?: string;
    changes?: Array<{
        field: string;
        oldValue?: string;
        newValue?: string;
    }>;
    correlationId?: string;
    tags?: string[];
}
