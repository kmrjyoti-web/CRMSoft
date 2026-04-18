export declare class UpdateChatbotFlowCommand {
    readonly flowId: string;
    readonly name?: string | undefined;
    readonly triggerKeywords?: string[] | undefined;
    readonly nodes?: Record<string, unknown> | undefined;
    constructor(flowId: string, name?: string | undefined, triggerKeywords?: string[] | undefined, nodes?: Record<string, unknown> | undefined);
}
