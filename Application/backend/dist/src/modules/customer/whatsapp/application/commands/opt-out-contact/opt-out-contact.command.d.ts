export declare class OptOutContactCommand {
    readonly wabaId: string;
    readonly phoneNumber: string;
    readonly contactId?: string | undefined;
    readonly reason?: string | undefined;
    constructor(wabaId: string, phoneNumber: string, contactId?: string | undefined, reason?: string | undefined);
}
