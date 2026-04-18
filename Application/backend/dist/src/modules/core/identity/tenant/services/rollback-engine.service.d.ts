import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class RollbackEngineService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listBackups(filters: {
        versionId?: string;
        backupType?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
    }>;
    createBackup(data: {
        versionId: string;
        backupType?: string;
        dbDumpPath?: string;
        configSnapshot?: Record<string, unknown>;
        schemaSnapshot?: string;
    }): Promise<any>;
    restoreBackup(id: string, restoredBy: string): Promise<any>;
    deleteBackup(id: string): Promise<any>;
}
