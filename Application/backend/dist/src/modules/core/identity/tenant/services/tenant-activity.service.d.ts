import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class TenantActivityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(data: {
        tenantId: string;
        action: string;
        category: string;
        details?: string;
        metadata?: Record<string, unknown>;
        performedById?: string;
        ipAddress?: string;
    }): Promise<{
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
    }>;
    getByTenant(tenantId: string, query: {
        category?: string;
        page?: number;
        limit?: number;
        dateFrom?: Date;
        dateTo?: Date;
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
        page: number;
        limit: number;
    }>;
    getRecent(limit?: number): Promise<({
        tenant: never;
    } & {
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
    })[]>;
}
