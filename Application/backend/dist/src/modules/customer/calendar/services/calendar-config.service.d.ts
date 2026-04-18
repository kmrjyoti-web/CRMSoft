import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare const CALENDAR_CONFIG_DEFAULTS: {
    configKey: string;
    value: Record<string, unknown>;
    description: string;
}[];
export declare class CalendarConfigService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getConfig(tenantId: string, key: string): Promise<any>;
    getAllConfigs(tenantId: string): Promise<{
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
        configKey: string;
        configValue: import("@prisma/working-client/runtime/library").JsonValue;
    }[]>;
    upsertConfig(tenantId: string, key: string, value: any, description?: string, updatedById?: string): Promise<{
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
        configKey: string;
        configValue: import("@prisma/working-client/runtime/library").JsonValue;
    }>;
    resetToDefaults(tenantId: string, updatedById?: string): Promise<void>;
}
