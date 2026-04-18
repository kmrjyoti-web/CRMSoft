import { PrismaService } from "../../../../core/prisma/prisma.service";
export declare class DevQANotionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateModuleTestPlan(planName: string, moduleNames: string[] | undefined, createdById: string, tenantId: string): Promise<{
        planId: string;
        itemCount: number;
    }>;
    private discoverComponents;
    syncToNotion(planId: string, tenantId: string): Promise<{
        notionUrl: string;
        syncedCount: number;
    }>;
    pullFromNotion(planId: string, tenantId: string): Promise<{
        updated: number;
    }>;
    private getNotionClient;
    private getOrCreateNotionDatabase;
    private toPascal;
}
