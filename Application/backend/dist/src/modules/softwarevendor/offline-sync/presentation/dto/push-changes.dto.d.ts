export declare class OfflineChangeDto {
    entityName: string;
    entityId?: string;
    action: string;
    data: Record<string, any>;
    previousValues?: Record<string, any>;
    clientTimestamp: string;
    clientVersion: number;
}
export declare class PushChangesDto {
    deviceId: string;
    changes: OfflineChangeDto[];
}
