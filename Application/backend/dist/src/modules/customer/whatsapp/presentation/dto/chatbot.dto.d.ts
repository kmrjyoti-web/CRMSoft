export declare class CreateChatbotFlowDto {
    wabaId: string;
    name: string;
    triggerKeywords: string[];
    nodes: Record<string, unknown>;
}
export declare class UpdateChatbotFlowDto {
    name?: string;
    triggerKeywords?: string[];
    nodes?: Record<string, unknown>;
}
export declare class ToggleChatbotFlowDto {
    status: string;
}
