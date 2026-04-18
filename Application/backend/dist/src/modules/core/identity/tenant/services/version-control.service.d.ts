import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class VersionControlService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listVersions(filters: {
        status?: string;
        releaseType?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<any>;
    create(data: {
        version: string;
        codeName?: string;
        releaseType?: string;
        changelog?: Record<string, unknown>[];
        breakingChanges?: Record<string, unknown>[];
        migrationNotes?: string;
        modulesUpdated?: string[];
        schemaChanges?: Record<string, unknown>;
        gitBranch?: string;
    }): Promise<any>;
    update(id: string, data: {
        codeName?: string;
        releaseType?: string;
        changelog?: Record<string, unknown>[];
        breakingChanges?: Record<string, unknown>[];
        migrationNotes?: string;
        modulesUpdated?: string[];
        schemaChanges?: Record<string, unknown>;
        gitBranch?: string;
        status?: string;
    }): Promise<any>;
    publish(id: string, deployedBy: string): Promise<any>;
    rollback(id: string, reason: string, rolledBackBy: string): Promise<any>;
    checkForceUpdate(tenantId: string): Promise<{
        pending: boolean;
        message: any;
        deadline: any;
    }>;
    getStats(): Promise<{
        total: any;
        byStatus: any;
        byReleaseType: any;
        recentDeployments: any;
    }>;
}
