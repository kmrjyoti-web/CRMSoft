interface BaseNodeData {
    label: string;
    description?: string;
    nodeCategory: 'trigger' | 'condition' | 'action' | 'flow' | 'utility';
    nodeSubType: string;
    icon: string;
    color: string;
    config: Record<string, any>;
    isConfigured: boolean;
}
interface GeneratedNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: BaseNodeData;
}
interface GeneratedEdge {
    id: string;
    source: string;
    target: string;
    type: string;
    label?: string;
    animated?: boolean;
}
export interface AiGenerateResult {
    nodes: GeneratedNode[];
    edges: GeneratedEdge[];
    description: string;
    suggestedName?: string;
}
export declare class WorkflowAiService {
    generateFromPrompt(prompt: string, _context?: any): AiGenerateResult;
    private matchPatterns;
    private matchActions;
    private matchDelays;
    private generateNodeDescription;
    private buildDescription;
    private buildSuggestedName;
}
export {};
