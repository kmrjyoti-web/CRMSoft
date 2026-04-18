export declare class CreateDemoCommand {
    readonly leadId: string;
    readonly userId: string;
    readonly mode: string;
    readonly scheduledAt: Date;
    readonly duration?: number | undefined;
    readonly meetingLink?: string | undefined;
    readonly location?: string | undefined;
    readonly notes?: string | undefined;
    constructor(leadId: string, userId: string, mode: string, scheduledAt: Date, duration?: number | undefined, meetingLink?: string | undefined, location?: string | undefined, notes?: string | undefined);
}
