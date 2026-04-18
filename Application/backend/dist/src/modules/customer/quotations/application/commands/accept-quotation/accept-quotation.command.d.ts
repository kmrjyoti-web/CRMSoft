export declare class AcceptQuotationCommand {
    readonly id: string;
    readonly userId: string;
    readonly userName: string;
    readonly note?: string | undefined;
    constructor(id: string, userId: string, userName: string, note?: string | undefined);
}
