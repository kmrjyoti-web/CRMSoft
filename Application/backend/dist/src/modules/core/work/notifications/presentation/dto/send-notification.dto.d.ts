export declare class SendNotificationDto {
    templateName: string;
    recipientId: string;
    variables: Record<string, string>;
    entityType?: string;
    entityId?: string;
    priority?: string;
    groupKey?: string;
    channelOverrides?: string[];
}
