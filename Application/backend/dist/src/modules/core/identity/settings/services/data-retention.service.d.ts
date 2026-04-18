import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { DataRetentionPolicy, RetentionAction } from '@prisma/identity-client';
export interface RetentionResult {
    entityName: string;
    action: RetentionAction;
    recordsAffected: number;
    skipped: boolean;
    reason?: string;
}
export declare class DataRetentionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAll(tenantId: string): Promise<DataRetentionPolicy[]>;
    update(tenantId: string, entityName: string, data: Record<string, any>): Promise<DataRetentionPolicy>;
    preview(tenantId: string, entityName: string): Promise<{
        recordCount: number;
        oldestRecord: Date | null;
        action: RetentionAction;
    }>;
    execute(tenantId: string): Promise<RetentionResult[]>;
    private buildWhere;
}
