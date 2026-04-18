import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class AuditCleanupService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    cleanupOldLogs(): Promise<{
        totalDeleted: number;
    }>;
    getCleanupPreview(): Promise<Array<{
        entityType: string;
        totalRecords: number;
        wouldDelete: number;
        retentionDays: number;
    }>>;
}
