export declare class ComposeEmailCommand {
    readonly accountId: string;
    readonly userId: string;
    readonly to: {
        email: string;
        name?: string;
    }[];
    readonly subject: string;
    readonly bodyHtml: string;
    readonly cc?: {
        email: string;
        name?: string;
    }[] | undefined;
    readonly bcc?: {
        email: string;
        name?: string;
    }[] | undefined;
    readonly bodyText?: string | undefined;
    readonly replyToEmailId?: string | undefined;
    readonly templateId?: string | undefined;
    readonly templateData?: Record<string, any> | undefined;
    readonly signatureId?: string | undefined;
    readonly scheduledAt?: Date | undefined;
    readonly sendNow?: boolean | undefined;
    readonly entityType?: string | undefined;
    readonly entityId?: string | undefined;
    readonly priority?: string | undefined;
    readonly trackOpens?: boolean | undefined;
    readonly trackClicks?: boolean | undefined;
    constructor(accountId: string, userId: string, to: {
        email: string;
        name?: string;
    }[], subject: string, bodyHtml: string, cc?: {
        email: string;
        name?: string;
    }[] | undefined, bcc?: {
        email: string;
        name?: string;
    }[] | undefined, bodyText?: string | undefined, replyToEmailId?: string | undefined, templateId?: string | undefined, templateData?: Record<string, any> | undefined, signatureId?: string | undefined, scheduledAt?: Date | undefined, sendNow?: boolean | undefined, entityType?: string | undefined, entityId?: string | undefined, priority?: string | undefined, trackOpens?: boolean | undefined, trackClicks?: boolean | undefined);
}
