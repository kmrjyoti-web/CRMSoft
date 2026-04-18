export declare class TrackEventCommand {
    readonly tenantId: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly eventType: string;
    readonly userId?: string | undefined;
    readonly source?: string | undefined;
    readonly deviceType?: string | undefined;
    readonly city?: string | undefined;
    readonly state?: string | undefined;
    readonly pincode?: string | undefined;
    readonly orderValue?: number | undefined;
    readonly metadata?: Record<string, any> | undefined;
    constructor(tenantId: string, entityType: string, entityId: string, eventType: string, userId?: string | undefined, source?: string | undefined, deviceType?: string | undefined, city?: string | undefined, state?: string | undefined, pincode?: string | undefined, orderValue?: number | undefined, metadata?: Record<string, any> | undefined);
}
