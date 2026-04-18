export declare class LinkEmailToEntityCommand {
    readonly emailId: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly userId: string;
    constructor(emailId: string, entityType: string, entityId: string, userId: string);
}
