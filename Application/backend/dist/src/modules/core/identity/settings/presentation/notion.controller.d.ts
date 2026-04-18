import { NotionSyncService } from '../services/notion-sync.service';
import { UpdateNotionConfigDto, CreateNotionEntryDto } from './dto/notion.dto';
export declare class NotionController {
    private readonly service;
    constructor(service: NotionSyncService);
    getConfig(req: any): Promise<{
        id: string;
        tenantId: string;
        tokenMasked: string;
        databaseId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    saveConfig(req: any, dto: UpdateNotionConfigDto): Promise<{
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
    testConnection(req: any): Promise<{
        success: boolean;
        user: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        user?: undefined;
    }>;
    listDatabases(req: any): Promise<{
        id: any;
        title: any;
    }[]>;
    createEntry(req: any, dto: CreateNotionEntryDto): Promise<{
        id: string;
        url: any;
    }>;
    listEntries(req: any): Promise<{
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
    listTestLogModules(req: any): Promise<{
        moduleId: string;
        moduleName: string;
        category?: string;
        notionStatus: string;
        notionPageId?: string;
        notionUrl?: string;
        lastSyncedAt?: string;
        syncState: "synced" | "not_synced";
    }[]>;
    syncModuleStatus(req: any, body: {
        moduleId: string;
        moduleName: string;
        status: 'Not Started' | 'In Progress' | 'Done' | 'Blocked';
        notes?: string;
    }): Promise<{
        id: string;
        url: string;
    }>;
    syncAllModules(req: any, body: {
        statuses?: Record<string, string>;
    }): Promise<{
        total: number;
        results: any[];
    }>;
    private buildModuleList;
}
