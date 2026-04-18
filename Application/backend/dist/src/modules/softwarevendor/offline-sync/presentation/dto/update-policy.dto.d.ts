export declare class UpdatePolicyDto {
    direction?: string;
    syncIntervalMinutes?: number;
    maxRowsOffline?: number | null;
    maxStorageMb?: number | null;
    maxDataAgeDays?: number | null;
    conflictStrategy?: string;
    downloadScope?: string;
    downloadFilter?: Record<string, any> | null;
    syncPriority?: number;
    isEnabled?: boolean;
}
