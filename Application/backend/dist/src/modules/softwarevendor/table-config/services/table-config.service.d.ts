import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class TableConfigService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getConfig(tableKey: string, userId: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        config: import("@prisma/working-client/runtime/library").JsonValue;
        userId: string | null;
        tableKey: string;
    } | null>;
    upsertUserConfig(tableKey: string, userId: string, tenantId: string, config: Record<string, any>): Promise<{
        id: string;
        tenantId: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        config: import("@prisma/working-client/runtime/library").JsonValue;
        userId: string | null;
        tableKey: string;
    }>;
    upsertTenantDefault(tableKey: string, tenantId: string, config: Record<string, any>): Promise<{
        id: string;
        tenantId: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        config: import("@prisma/working-client/runtime/library").JsonValue;
        userId: string | null;
        tableKey: string;
    }>;
    deleteUserConfig(tableKey: string, userId: string, tenantId: string): Promise<{
        deleted: boolean;
    }>;
}
