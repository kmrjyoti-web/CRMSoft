export declare class SendTemplateMessageCommand {
    readonly wabaId: string;
    readonly conversationId: string;
    readonly templateId: string;
    readonly variables: any;
    readonly userId: string;
    constructor(wabaId: string, conversationId: string, templateId: string, variables: any, userId: string);
}
