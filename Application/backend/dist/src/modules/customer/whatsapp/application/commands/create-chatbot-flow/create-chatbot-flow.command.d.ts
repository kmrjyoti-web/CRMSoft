export declare class CreateChatbotFlowCommand {
    readonly wabaId: string;
    readonly name: string;
    readonly triggerKeywords: string[];
    readonly nodes: any;
    readonly userId: string;
    constructor(wabaId: string, name: string, triggerKeywords: string[], nodes: any, userId: string);
}
