import { DataRetentionService } from '../services/data-retention.service';
import { UpdateDataRetentionDto } from './dto/update-data-retention.dto';
export declare class DataRetentionController {
    private readonly service;
    constructor(service: DataRetentionService);
    getAll(req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        displayName: string;
        isEnabled: boolean;
        action: import("@prisma/identity-client").$Enums.RetentionAction;
        entityName: string;
        lastExecutedAt: Date | null;
        retentionDays: number;
        scopeFilter: import("@prisma/identity-client/runtime/library").JsonValue | null;
        lastRecordsAffected: number | null;
        requireApproval: boolean;
        notifyBeforeDays: number | null;
    }[]>;
    update(req: any, entityName: string, dto: UpdateDataRetentionDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        displayName: string;
        isEnabled: boolean;
        action: import("@prisma/identity-client").$Enums.RetentionAction;
        entityName: string;
        lastExecutedAt: Date | null;
        retentionDays: number;
        scopeFilter: import("@prisma/identity-client/runtime/library").JsonValue | null;
        lastRecordsAffected: number | null;
        requireApproval: boolean;
        notifyBeforeDays: number | null;
    }>;
    preview(req: any, entityName: string): Promise<{
        recordCount: number;
        oldestRecord: Date | null;
        action: import("@prisma/identity-client").RetentionAction;
    }>;
    execute(req: any): Promise<import("../services/data-retention.service").RetentionResult[]>;
}
