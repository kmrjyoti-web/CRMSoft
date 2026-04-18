export declare class CancelQuotationCommand {
    readonly id: string;
    readonly userId: string;
    readonly userName: string;
    readonly reason?: string | undefined;
    constructor(id: string, userId: string, userName: string, reason?: string | undefined);
}
