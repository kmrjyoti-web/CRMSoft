export declare class SendNotificationCommand {
    readonly templateName: string;
    readonly recipientId: string;
    readonly variables: Record<string, string>;
    readonly senderId?: string | undefined;
    readonly entityType?: string | undefined;
    readonly entityId?: string | undefined;
    readonly priority?: string | undefined;
    readonly groupKey?: string | undefined;
    readonly channelOverrides?: string[] | undefined;
    constructor(templateName: string, recipientId: string, variables: Record<string, string>, senderId?: string | undefined, entityType?: string | undefined, entityId?: string | undefined, priority?: string | undefined, groupKey?: string | undefined, channelOverrides?: string[] | undefined);
}
