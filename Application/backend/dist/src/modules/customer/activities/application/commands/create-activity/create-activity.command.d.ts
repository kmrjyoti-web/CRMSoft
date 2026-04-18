export declare class CreateActivityCommand {
    readonly type: string;
    readonly subject: string;
    readonly userId: string;
    readonly description?: string | undefined;
    readonly scheduledAt?: Date | undefined;
    readonly endTime?: Date | undefined;
    readonly duration?: number | undefined;
    readonly leadId?: string | undefined;
    readonly contactId?: string | undefined;
    readonly locationName?: string | undefined;
    readonly latitude?: number | undefined;
    readonly longitude?: number | undefined;
    readonly reminderMinutesBefore?: number | undefined;
    readonly taggedUserIds?: string[] | undefined;
    readonly tenantId?: string | undefined;
    constructor(type: string, subject: string, userId: string, description?: string | undefined, scheduledAt?: Date | undefined, endTime?: Date | undefined, duration?: number | undefined, leadId?: string | undefined, contactId?: string | undefined, locationName?: string | undefined, latitude?: number | undefined, longitude?: number | undefined, reminderMinutesBefore?: number | undefined, taggedUserIds?: string[] | undefined, tenantId?: string | undefined);
}
