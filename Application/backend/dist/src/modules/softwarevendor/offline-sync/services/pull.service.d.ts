import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EntityResolverService } from './entity-resolver.service';
import { SyncScopeResolverService } from './sync-scope-resolver.service';
export interface PullParams {
    entityName: string;
    userId: string;
    deviceId: string;
    lastPulledAt: Date | null;
    cursor?: string;
    limit?: number;
}
export interface PullResult {
    entityName: string;
    records: Record<string, unknown>[];
    deletedIds: string[];
    totalAvailable: number;
    downloadedCount: number;
    serverTimestamp: Date;
    hasMore: boolean;
    nextCursor: string | null;
}
export interface FullSyncResult {
    entities: {
        name: string;
        count: number;
        timestamp: Date;
    }[];
    totalRecords: number;
    durationMs: number;
}
export declare class PullService {
    private readonly prisma;
    private readonly entityResolver;
    private readonly scopeResolver;
    private readonly logger;
    constructor(prisma: PrismaService, entityResolver: EntityResolverService, scopeResolver: SyncScopeResolverService);
    pull(params: PullParams): Promise<PullResult>;
    fullSync(userId: string, deviceId: string): Promise<FullSyncResult>;
    private findDeletedIds;
    private stripExcludedFields;
    private updateDeviceSyncState;
    private parseDownloadFilter;
}
