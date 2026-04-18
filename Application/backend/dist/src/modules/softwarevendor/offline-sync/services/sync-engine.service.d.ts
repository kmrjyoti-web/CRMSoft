import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WarningEvaluatorService, WarningEvaluation } from './warning-evaluator.service';
export interface SyncConfig {
    policies: SyncPolicyConfig[];
    warningRules: SyncWarningRuleConfig[];
    globalSettings: GlobalSyncSettings;
    serverTimestamp: string;
}
export interface SyncPolicyConfig {
    entityName: string;
    displayName: string;
    direction: string;
    syncIntervalMinutes: number;
    maxRowsOffline: number | null;
    maxDataAgeDays: number | null;
    conflictStrategy: string;
    downloadScope: string;
    syncPriority: number;
}
export interface SyncWarningRuleConfig {
    ruleId: string;
    name: string;
    trigger: string;
    entity: string | null;
    level1: {
        threshold: number | null;
        action: string;
        message: string | null;
    } | null;
    level2: {
        threshold: number | null;
        action: string | null;
        delayMinutes: number | null;
        message: string | null;
    } | null;
    level3: {
        threshold: number | null;
        action: string | null;
        message: string | null;
    } | null;
}
export interface GlobalSyncSettings {
    maxTotalStorageMb: number;
    heartbeatIntervalMinutes: number;
    syncOnAppOpen: boolean;
    syncOnNetworkRestore: boolean;
    requireSyncBeforeActivity: boolean;
    maxOfflineDaysBeforeLock: number;
}
export interface SyncStatus {
    device: any;
    warnings: WarningEvaluation;
}
export declare class SyncEngineService {
    private readonly prisma;
    private readonly warningEvaluator;
    private readonly logger;
    constructor(prisma: PrismaService, warningEvaluator: WarningEvaluatorService);
    getConfig(userId: string): Promise<SyncConfig>;
    getSyncStatus(userId: string, deviceId: string): Promise<SyncStatus>;
    registerDevice(userId: string, deviceInfo: {
        deviceId: string;
        deviceName?: string;
        deviceType?: string;
        platform?: string;
        appVersion?: string;
    }): Promise<Record<string, unknown>>;
    removeDevice(userId: string, deviceId: string): Promise<void>;
    heartbeat(userId: string, deviceId: string, statusData: {
        pendingUploadCount?: number;
        storageUsedMb?: number;
        recordCounts?: Record<string, number>;
        entitySyncState?: Record<string, any>;
    }, ipAddress?: string): Promise<void>;
    blockDevice(deviceDbId: string): Promise<void>;
    getDevices(filters: {
        userId?: string;
        status?: string;
    }): Promise<any[]>;
}
