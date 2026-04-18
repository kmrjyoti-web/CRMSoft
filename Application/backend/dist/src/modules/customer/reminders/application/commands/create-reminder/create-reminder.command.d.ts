export declare class CreateReminderCommand {
    readonly title: string;
    readonly scheduledAt: Date;
    readonly recipientId: string;
    readonly createdById: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly channel?: string | undefined;
    readonly message?: string | undefined;
    constructor(title: string, scheduledAt: Date, recipientId: string, createdById: string, entityType: string, entityId: string, channel?: string | undefined, message?: string | undefined);
}
