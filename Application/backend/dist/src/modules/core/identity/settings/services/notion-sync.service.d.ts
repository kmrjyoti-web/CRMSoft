import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class NotionSyncService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getConfig(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        tokenMasked: string;
        databaseId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    saveConfig(tenantId: string, token: string, databaseId?: string, userId?: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        token: string;
        databaseId: string | null;
    }>;
    testConnection(tenantId: string): Promise<{
        success: boolean;
        user: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        user?: undefined;
    }>;
    listDatabases(tenantId: string): Promise<{
        id: any;
        title: any;
    }[]>;
    createEntry(tenantId: string, data: {
        promptNumber: string;
        title: string;
        description?: string;
        status: string;
        filesChanged?: string;
        testResults?: string;
    }): Promise<{
        id: string;
        url: any;
    }>;
    listEntries(tenantId: string): Promise<{
        id: any;
        promptNumber: any;
        title: any;
        description: any;
        status: any;
        filesChanged: any;
        testResults: any;
        date: any;
        url: any;
    }[]>;
    syncModuleTestStatus(tenantId: string, moduleId: string, moduleName: string, status: 'Not Started' | 'In Progress' | 'Done' | 'Blocked', notes?: string): Promise<{
        id: string;
        url: string;
    }>;
    listModuleTestStatuses(tenantId: string, modules: Array<{
        id: string;
        name: string;
        category?: string;
    }>): Promise<Array<{
        moduleId: string;
        moduleName: string;
        category?: string;
        notionStatus: string;
        notionPageId?: string;
        notionUrl?: string;
        lastSyncedAt?: string;
        syncState: 'synced' | 'not_synced';
    }>>;
    private getClient;
}
