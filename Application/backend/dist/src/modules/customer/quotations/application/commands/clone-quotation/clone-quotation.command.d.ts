export declare class CloneQuotationCommand {
    readonly id: string;
    readonly userId: string;
    readonly userName: string;
    readonly leadId?: string | undefined;
    constructor(id: string, userId: string, userName: string, leadId?: string | undefined);
}
