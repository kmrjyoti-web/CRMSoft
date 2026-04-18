import { ApiResponse } from '../../../../../common/utils/api-response';
import { VersionControlService } from '../services/version-control.service';
import { IndustryPatchingService } from '../services/industry-patching.service';
import { RollbackEngineService } from '../services/rollback-engine.service';
import { NotionDocsService } from '../services/notion-docs.service';
export declare class VendorVersionsController {
    private readonly versionService;
    private readonly patchingService;
    private readonly rollbackService;
    private readonly notionService;
    constructor(versionService: VersionControlService, patchingService: IndustryPatchingService, rollbackService: RollbackEngineService, notionService: NotionDocsService);
    listVersions(status?: string, releaseType?: string, search?: string, page?: string, limit?: string): Promise<ApiResponse<unknown[]>>;
    getStats(): Promise<ApiResponse<{
        total: any;
        byStatus: any;
        byReleaseType: any;
        recentDeployments: any;
    }>>;
    getVersion(id: string): Promise<ApiResponse<any>>;
    createVersion(body: {
        version: string;
        codeName?: string;
        releaseType?: string;
        changelog?: Record<string, unknown>[];
        breakingChanges?: Record<string, unknown>[];
        migrationNotes?: string;
        modulesUpdated?: string[];
        schemaChanges?: Record<string, unknown>;
        gitBranch?: string;
    }): Promise<ApiResponse<any>>;
    updateVersion(id: string, body: any): Promise<ApiResponse<any>>;
    publishVersion(id: string, user: any): Promise<ApiResponse<any>>;
    rollbackVersion(id: string, user: any, reason: string): Promise<ApiResponse<any>>;
    listPatches(versionId: string, industryCode?: string, status?: string, page?: string, limit?: string): Promise<ApiResponse<unknown[]>>;
    createPatch(versionId: string, body: {
        industryCode: string;
        patchName: string;
        description?: string;
        schemaChanges?: Record<string, unknown>;
        seedData?: Record<string, unknown>;
        configOverrides?: Record<string, unknown>;
        menuOverrides?: Record<string, unknown>;
        forceUpdate?: boolean;
    }): Promise<ApiResponse<any>>;
    applyPatch(patchId: string, user: any): Promise<ApiResponse<any>>;
    rollbackPatch(patchId: string): Promise<ApiResponse<any>>;
    listBackups(versionId: string, backupType?: string, page?: string, limit?: string): Promise<ApiResponse<unknown[]>>;
    createBackup(versionId: string, body: {
        backupType?: string;
        dbDumpPath?: string;
        configSnapshot?: Record<string, unknown>;
        schemaSnapshot?: string;
    }): Promise<ApiResponse<any>>;
    restoreBackup(backupId: string, user: any): Promise<ApiResponse<any>>;
    deleteBackup(backupId: string): Promise<ApiResponse<null>>;
    publishToNotion(id: string): Promise<ApiResponse<{
        notionPageId: string | null;
    }>>;
    notionStatus(): Promise<ApiResponse<{
        configured: boolean;
        hasDatabaseId: boolean;
    }>>;
}
export declare class TenantForceUpdateController {
    private readonly versionService;
    constructor(versionService: VersionControlService);
    checkForceUpdate(user: any): Promise<ApiResponse<{
        pending: boolean;
        message: any;
        deadline: any;
    }>>;
}
