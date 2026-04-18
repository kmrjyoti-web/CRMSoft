export declare class SendQuotationCommand {
    readonly id: string;
    readonly userId: string;
    readonly userName: string;
    readonly channel: string;
    readonly receiverContactId?: string | undefined;
    readonly receiverEmail?: string | undefined;
    readonly receiverPhone?: string | undefined;
    readonly message?: string | undefined;
    constructor(id: string, userId: string, userName: string, channel: string, receiverContactId?: string | undefined, receiverEmail?: string | undefined, receiverPhone?: string | undefined, message?: string | undefined);
}
