import { PrismaService } from '../../../core/prisma/prisma.service';
export declare class TaskLogicService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getConfig<T = any>(key: string, tenantId?: string): Promise<T | null>;
    getAllConfigs(tenantId?: string): Promise<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        value: import("@prisma/working-client/runtime/library").JsonValue;
        configKey: string;
    }[]>;
    upsertConfig(key: string, value: any, description?: string, tenantId?: string): Promise<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        value: import("@prisma/working-client/runtime/library").JsonValue;
        configKey: string;
    }>;
    deleteConfig(key: string, tenantId?: string): Promise<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        value: import("@prisma/working-client/runtime/library").JsonValue;
        configKey: string;
    }>;
}
