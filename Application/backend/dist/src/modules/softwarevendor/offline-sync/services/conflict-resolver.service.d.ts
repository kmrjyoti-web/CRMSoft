import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ConflictStrategy } from '@prisma/working-client';
import { EntityResolverService } from './entity-resolver.service';
export interface ConflictResolveParams {
    entityName: string;
    entityId: string;
    clientData: Record<string, any>;
    serverData: Record<string, any>;
    baseData?: Record<string, any>;
    clientTimestamp: Date;
    serverTimestamp: Date;
    strategy: ConflictStrategy;
    userId: string;
    deviceId: string;
    entityLabel?: string;
}
export interface ConflictResolution {
    resolved: boolean;
    strategy: string;
    finalData: Record<string, any> | null;
    conflictId: string;
    conflictingFields: FieldConflict[];
    autoMergedFields: MergedField[];
}
export interface FieldConflict {
    field: string;
    clientValue: Record<string, unknown>;
    serverValue: Record<string, unknown>;
    baseValue?: Record<string, unknown>;
}
export interface MergedField {
    field: string;
    value: Record<string, unknown>;
    source: 'CLIENT' | 'SERVER';
}
export declare class ConflictResolverService {
    private readonly prisma;
    private readonly entityResolver;
    private readonly logger;
    constructor(prisma: PrismaService, entityResolver: EntityResolverService);
    resolve(params: ConflictResolveParams): Promise<ConflictResolution>;
    manualResolve(conflictId: string, resolution: {
        resolvedData: Record<string, any>;
        userId: string;
    }): Promise<void>;
    getPendingConflicts(userId: string): Promise<any[]>;
    getConflictDetail(conflictId: string): Promise<Record<string, unknown>>;
    private detectFieldConflicts;
    private mergeFields;
    private applyToDatabase;
}
