import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface LogUsageParams {
    tenantId: string;
    userId: string;
    provider: string;
    model: string;
    operation: string;
    promptTokens?: number;
    outputTokens?: number;
    latencyMs: number;
    success: boolean;
    errorMessage?: string;
    entityType?: string;
    entityId?: string;
}
export declare class AiUsageService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(params: LogUsageParams): Promise<{
        id: string;
        tenantId: string;
        entityType: string | null;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        userId: string;
        model: string;
        errorMessage: string | null;
        entityId: string | null;
        latencyMs: number;
        success: boolean;
        provider: string;
        operation: string;
        promptTokens: number;
        outputTokens: number;
        totalTokens: number;
    }>;
    getUsageStats(tenantId: string): Promise<{
        provider: string;
        model: string;
        totalTokens: number;
        promptTokens: number;
        outputTokens: number;
        requestCount: number;
        successCount: number;
        failureCount: number;
    }[]>;
}
