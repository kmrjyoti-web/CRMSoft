export declare class SoftDeleteContactCommand {
    readonly contactId: string;
    readonly deletedById: string;
    constructor(contactId: string, deletedById: string);
}
