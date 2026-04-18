export declare class CreateQuickReplyCommand {
    readonly wabaId: string;
    readonly shortcut: string;
    readonly message: string;
    readonly userId: string;
    readonly category?: string | undefined;
    constructor(wabaId: string, shortcut: string, message: string, userId: string, category?: string | undefined);
}
