export declare class CreateTourPlanCommand {
    readonly title: string;
    readonly planDate: Date;
    readonly userId: string;
    readonly leadId: string;
    readonly description?: string | undefined;
    readonly startLocation?: string | undefined;
    readonly endLocation?: string | undefined;
    readonly visits?: Array<{
        leadId?: string;
        contactId?: string;
        scheduledTime?: Date;
        sortOrder?: number;
    }> | undefined;
    constructor(title: string, planDate: Date, userId: string, leadId: string, description?: string | undefined, startLocation?: string | undefined, endLocation?: string | undefined, visits?: Array<{
        leadId?: string;
        contactId?: string;
        scheduledTime?: Date;
        sortOrder?: number;
    }> | undefined);
}
