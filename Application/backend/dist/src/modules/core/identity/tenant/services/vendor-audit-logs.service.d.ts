import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class VendorAuditLogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters: {
        tenantId?: string;
        category?: string;
        action?: string;
        page: number;
        limit: number;
    }): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            category: string;
            metadata: import("@prisma/platform-client/runtime/library").JsonValue | null;
            action: string;
            details: string | null;
            performedById: string | null;
            ipAddress: string | null;
        }[];
        total: number;
    }>;
}
