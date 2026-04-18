export declare class ChangeLeadStatusCommand {
    readonly leadId: string;
    readonly newStatus: string;
    readonly reason?: string | undefined;
    constructor(leadId: string, newStatus: string, reason?: string | undefined);
}
