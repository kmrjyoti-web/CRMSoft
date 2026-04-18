import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class AiSettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    get(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        isEnabled: boolean;
        defaultProvider: string;
        defaultModel: string;
        taskOverrides: import("@prisma/working-client/runtime/library").JsonValue | null;
        monthlyTokenBudget: number | null;
    }>;
    update(tenantId: string, data: {
        defaultProvider?: string;
        defaultModel?: string;
        taskOverrides?: Record<string, string>;
        isEnabled?: boolean;
        monthlyTokenBudget?: number;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        isEnabled: boolean;
        defaultProvider: string;
        defaultModel: string;
        taskOverrides: import("@prisma/working-client/runtime/library").JsonValue | null;
        monthlyTokenBudget: number | null;
    }>;
}
