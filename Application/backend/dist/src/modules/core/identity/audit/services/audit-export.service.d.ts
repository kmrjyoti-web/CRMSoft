import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class AuditExportService {
    private readonly prisma;
    private readonly logger;
    private readonly exportDir;
    constructor(prisma: PrismaService);
    exportAuditTrail(params: {
        format: string;
        entityType?: string;
        entityId?: string;
        userId?: string;
        dateFrom: Date;
        dateTo: Date;
        exportedById: string;
    }): Promise<{
        fileUrl: string;
        recordCount: number;
    }>;
}
