export declare class HeartbeatDto {
    deviceId: string;
    pendingUploadCount?: number;
    storageUsedMb?: number;
    recordCounts?: Record<string, number>;
    entitySyncState?: Record<string, any>;
}
