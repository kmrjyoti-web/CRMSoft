import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EntityResolverService } from './entity-resolver.service';
import { ConflictResolverService } from './conflict-resolver.service';
export interface OfflineChange {
    entityName: string;
    entityId?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE';
    data: Record<string, any>;
    previousValues?: Record<string, any>;
    clientTimestamp: string;
    clientVersion: number;
}
export interface PushParams {
    userId: string;
    deviceId: string;
    changes: OfflineChange[];
}
export interface PushChangeResult {
    entityName: string;
    entityId: string | null;
    action: string;
    status: string;
    serverId?: string;
    conflictId?: string;
    error?: string;
}
export interface PushResult {
    results: PushChangeResult[];
    totalProcessed: number;
    successful: number;
    conflicts: number;
    failed: number;
}
export declare class PushService {
    private readonly prisma;
    private readonly entityResolver;
    private readonly conflictResolver;
    private readonly logger;
    constructor(prisma: PrismaService, entityResolver: EntityResolverService, conflictResolver: ConflictResolverService);
    push(params: PushParams): Promise<PushResult>;
    private processChange;
    private updateDevicePendingCount;
}
