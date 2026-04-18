import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class IndustryPatchingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPatches(filters: {
        versionId?: string;
        industryCode?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
    }>;
    create(data: {
        versionId: string;
        industryCode: string;
        patchName: string;
        description?: string;
        schemaChanges?: Record<string, unknown>;
        seedData?: Record<string, unknown>;
        configOverrides?: Record<string, unknown>;
        menuOverrides?: Record<string, unknown>;
        forceUpdate?: boolean;
    }): Promise<any>;
    applyPatch(id: string, appliedBy: string): Promise<any>;
    rollbackPatch(id: string): Promise<any>;
    private createForceUpdateEntries;
}
