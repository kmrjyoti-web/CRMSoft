export declare class SendInteractiveMessageCommand {
    readonly wabaId: string;
    readonly conversationId: string;
    readonly interactiveType: string;
    readonly interactiveData: any;
    readonly userId: string;
    constructor(wabaId: string, conversationId: string, interactiveType: string, interactiveData: any, userId: string);
}
